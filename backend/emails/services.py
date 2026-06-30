import logging
import re
from dataclasses import dataclass
from typing import Any

import requests
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from auditLog.audit_log_utils import log_action
from .models import (
    AIResponse,
    AI_Feedback,
    Email,
    EmailClassification,
    EmailDispatchLog,
    EmailPipelineConfig,
)

logger = logging.getLogger(__name__)


CATEGORY_RULES = {
    "ADMISSION": [
        "admission",
        "apply",
        "application",
        "entry requirement",
        "intake",
        "deadline",
        "scholarship",
        "requirements",
        "prospectus",
    ],
    "FEES": [
        "fee",
        "payment",
        "tuition",
        "invoice",
        "receipt",
        "balance",
        "bank",
        "installment",
        "finance",
    ],
    "REGISTRATION": [
        "registration",
        "register",
        "course",
        "calendar",
        "timetable",
        "module",
        "add/drop",
        "semester",
        "enroll",
    ],
    "EXAM": [
        "exam",
        "examination",
        "results",
        "grades",
        "transcript",
        "mark",
        "assessment",
        "retake",
        "supplementary",
    ],
    "ADMIN": [
        "certificate",
        "clearance",
        "letter",
        "form",
        "general",
        "administrative",
        "request",
        "support",
        "inquiry",
    ],
}

CATEGORY_RESPONSES = {
    "ADMISSION": (
        "Thank you for contacting the University of Kigali Admissions Office.\n\n"
        "We have received your inquiry and are happy to assist with admission requirements, application status, "
        "and intake deadlines. Please review the latest program information and ensure that all required documents "
        "are included in your application.\n\n"
        "If you would like, we can share the current admissions checklist and next intake timeline.\n\n"
    ),
    "FEES": (
        "Thank you for your message regarding fees and payment.\n\n"
        "Please confirm your student reference number or invoice details so that the Finance Department can verify "
        "the correct account status. If your concern relates to tuition balance, receipts, or installment plans, "
        "we will guide you through the available options.\n\n"
    ),
    "REGISTRATION": (
        "Thank you for reaching out about course registration and the academic calendar.\n\n"
        "Please review the registration period, add/drop deadlines, and semester timeline. If you are unable to "
        "register for a course, share the course code and programme so we can check for prerequisites or timetable "
        "conflicts.\n\n"
    ),
    "EXAM": (
        "Thank you for your inquiry about examinations and results.\n\n"
        "Please include your student registration number and the specific course or assessment you are asking about. "
        "This will help the Exams Office confirm the status of results, transcript access, or supplementary exams.\n\n"
    ),
    "ADMIN": (
        "Thank you for contacting the University of Kigali.\n\n"
        "We have received your administrative request and will direct it to the appropriate office. If additional "
        "information is needed, the relevant team will follow up with you shortly.\n\n"
    ),
}


def _safe_email_name(email_address: str) -> str:
    local_part = (email_address or "").split("@")[0]
    return re.sub(r"[._-]+", " ", local_part).strip().title() or "Student"


class EmailTextProcessor:
    STOP_WORDS = {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "but",
        "by",
        "for",
        "from",
        "has",
        "have",
        "he",
        "her",
        "him",
        "his",
        "i",
        "in",
        "is",
        "it",
        "its",
        "me",
        "my",
        "of",
        "on",
        "or",
        "our",
        "she",
        "that",
        "the",
        "their",
        "them",
        "they",
        "this",
        "to",
        "was",
        "we",
        "were",
        "with",
        "you",
        "your",
    }

    EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
    PHONE_RE = re.compile(r"(\+?\d[\d\s().-]{7,}\d)")
    ID_RE = re.compile(r"\b\d{5,}\b")

    def normalize(self, text: str) -> str:
        text = text or ""
        text = text.lower()
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def redact_pii(self, text: str) -> str:
        text = self.EMAIL_RE.sub("[redacted-email]", text or "")
        text = self.PHONE_RE.sub("[redacted-phone]", text)
        text = self.ID_RE.sub("[redacted-id]", text)
        return text

    def tokenize(self, text: str) -> list[str]:
        tokens = re.findall(r"[a-zA-Z']+", self.normalize(text))
        return [token for token in tokens if token not in self.STOP_WORDS]

    def build_corpus(self, email: Email) -> str:
        pieces = [
            email.sender_name,
            email.sender_email,
            email.subject,
            email.body,
            email.metadata.get("raw_text", ""),
        ]
        return " ".join([piece for piece in pieces if piece])

    def extract_features(self, email: Email) -> dict[str, Any]:
        corpus = self.build_corpus(email)
        normalized = self.normalize(corpus)
        tokens = self.tokenize(corpus)
        return {
            "token_count": len(tokens),
            "unique_token_count": len(set(tokens)),
            "subject_length": len(email.subject or ""),
            "body_length": len(email.body or ""),
            "has_attachment": bool(email.attachment),
            "sender_domain": (email.sender_email or "").split("@")[-1].lower(),
            "contains_deadline": "deadline" in normalized,
            "contains_payment": any(term in normalized for term in ("payment", "fee", "invoice")),
            "contains_exam": any(term in normalized for term in ("exam", "result", "grade")),
        }


class IntentClassifierService:
    def __init__(self, config: EmailPipelineConfig | None = None):
        self.config = config or EmailPipelineConfig.get_solo()
        self.processor = EmailTextProcessor()

    def _score_category(self, text: str, keywords: list[str]) -> tuple[float, list[str]]:
        normalized = self.processor.normalize(text)
        matches = []
        score = 0.0
        for keyword in keywords:
            pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
            if re.search(pattern, normalized):
                matches.append(keyword)
                score += 1.0
        return score, matches

    def predict(self, email: Email) -> dict[str, Any]:
        external_endpoint = (self.config.classifier_endpoint or "").strip()
        if external_endpoint:
            try:
                response = requests.post(
                    external_endpoint,
                    json={
                        "subject": email.subject,
                        "body": email.body,
                        "sender_email": email.sender_email,
                        "sender_name": email.sender_name,
                        "metadata": email.metadata,
                    },
                    timeout=10,
                )
                response.raise_for_status()
                payload = response.json()
                category = payload.get("category", "ADMIN")
                confidence = float(payload.get("confidence_score", 0.5))
                return {
                    "category": category,
                    "confidence_score": confidence,
                    "model_name": payload.get("model_name", "external-classifier"),
                    "rationale": payload.get("rationale", "External classifier response"),
                    "features": payload.get("features", self.processor.extract_features(email)),
                }
            except Exception as exc:
                logger.warning("External classifier unavailable, using local fallback: %s", exc)

        corpus = self.processor.build_corpus(email)
        feature_map = self.processor.extract_features(email)
        scored = []
        for category, keywords in CATEGORY_RULES.items():
            score, matches = self._score_category(corpus, keywords)
            if email.attachment and category in {"FEES", "ADMIN"}:
                score += 0.2
            if feature_map["contains_payment"] and category == "FEES":
                score += 0.4
            if feature_map["contains_deadline"] and category == "ADMISSION":
                score += 0.2
            scored.append((category, score, matches))

        scored.sort(key=lambda item: item[1], reverse=True)
        best_category, best_score, best_matches = scored[0]
        runner_up_score = scored[1][1] if len(scored) > 1 else 0.0
        confidence = 0.55 + (best_score * 0.12) + max(0.0, (best_score - runner_up_score) * 0.05)
        confidence = min(confidence, 0.99)
        if best_score == 0:
            best_category = "ADMIN"
            confidence = 0.58
            best_matches = []

        rationale = (
            f"Matched keywords: {', '.join(best_matches)}"
            if best_matches
            else "No strong keyword match found; routed to the general administrative category."
        )
        return {
            "category": best_category,
            "confidence_score": round(confidence, 3),
            "model_name": "heuristic-bert-adapter",
            "rationale": rationale,
            "features": feature_map,
        }


class ResponseGeneratorService:
    def __init__(self, config: EmailPipelineConfig | None = None):
        self.config = config or EmailPipelineConfig.get_solo()
        self.processor = EmailTextProcessor()

    def _external_generate(self, prompt: str) -> str | None:
        external_endpoint = (self.config.generator_endpoint or "").strip()
        if not external_endpoint:
            return None

        try:
            response = requests.post(
                external_endpoint,
                json={"prompt": prompt},
                timeout=15,
            )
            response.raise_for_status()
            payload = response.json()
            return payload.get("generated_text") or payload.get("text")
        except Exception as exc:
            logger.warning("External generator unavailable, using local templates: %s", exc)
            return None

    def generate(self, email: Email, category: str, confidence_score: float, features: dict[str, Any]) -> dict[str, str]:
        greeting_name = email.sender_name or _safe_email_name(email.sender_email)
        prompt = (
            f"Write a formal University of Kigali reply for category {category}. "
            f"Email subject: {email.subject}. Confidence: {confidence_score}. "
            f"Sender: {greeting_name}. Key features: {features}."
        )
        external = self._external_generate(prompt)
        if external:
            return {
                "generated_text": external.strip(),
                "model_name": "external-generator",
                "subject": f"Re: {email.subject}",
            }

        body = CATEGORY_RESPONSES.get(category, CATEGORY_RESPONSES["ADMIN"])
        body += (
            f"Dear {greeting_name},\n\n"
            f"We will continue assisting you based on the details provided. If you have supporting documents or a "
            f"reference number, kindly include them in your next message so we can respond faster.\n\n"
            f"Kind regards,\n"
            f"{self.config.reply_signature}\n"
        )
        if email.attachment:
            body += "\nWe also noted that your email includes an attachment, which will be reviewed with your request.\n"

        return {
            "generated_text": body.strip(),
            "model_name": "heuristic-t5-adapter",
            "subject": f"Re: {email.subject}",
        }


class EmailDispatchService:
    def __init__(self, config: EmailPipelineConfig | None = None):
        self.config = config or EmailPipelineConfig.get_solo()

    def dispatch(self, email: Email, response: AIResponse, *, dry_run: bool = False) -> dict[str, Any]:
        recipient = email.sender_email
        subject = response.subject or f"Re: {email.subject}"
        message = response.generated_text
        dispatch_mode = self.config.email_dispatch_mode
        effective_dry_run = dry_run or dispatch_mode == "dry_run"

        dispatch_log = EmailDispatchLog.objects.create(
            email=email,
            response=response,
            status="QUEUED" if effective_dry_run else "SENDING",
            details={"dispatch_mode": dispatch_mode, "dry_run": effective_dry_run},
        )

        if effective_dry_run:
            dispatch_log.status = "SENT"
            dispatch_log.details["simulated"] = True
            dispatch_log.save(update_fields=["status", "details"])
            return {"sent": True, "simulated": True, "dispatch_log_id": dispatch_log.id}

        try:
            if dispatch_mode == "smtp":
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    fail_silently=False,
                )
            elif dispatch_mode == "external_api":
                external_endpoint = (self.config.dispatch_endpoint or "").strip()
                if not external_endpoint:
                    raise ValueError("External API dispatch mode requires a configured endpoint.")
                requests.post(
                    external_endpoint,
                    json={
                        "recipient": recipient,
                        "subject": subject,
                        "message": message,
                        "email_id": email.id,
                    },
                    timeout=15,
                ).raise_for_status()
            else:
                raise ValueError(f"Unsupported dispatch mode: {dispatch_mode}")

            dispatch_log.status = "SENT"
            dispatch_log.details["simulated"] = False
            dispatch_log.save(update_fields=["status", "details"])
            return {"sent": True, "simulated": False, "dispatch_log_id": dispatch_log.id}
        except Exception as exc:
            dispatch_log.status = "FAILED"
            dispatch_log.details["error"] = str(exc)
            dispatch_log.save(update_fields=["status", "details"])
            return {"sent": False, "error": str(exc), "dispatch_log_id": dispatch_log.id}


class EmailPipelineService:
    def __init__(self, config: EmailPipelineConfig | None = None):
        self.config = config or EmailPipelineConfig.get_solo()
        self.processor = EmailTextProcessor()
        self.classifier = IntentClassifierService(self.config)
        self.generator = ResponseGeneratorService(self.config)
        self.dispatcher = EmailDispatchService(self.config)

    @transaction.atomic
    def process_email(
        self,
        payload: dict[str, Any],
        *,
        assigned_to=None,
        request=None,
        force_review: bool = False,
        force_dispatch: bool | None = None,
    ) -> dict[str, Any]:
        email = Email.objects.create(
            sender_name=payload.get("sender_name", "") or "",
            sender_email=payload["sender_email"],
            subject=payload["subject"],
            body=payload["body"],
            attachment=bool(payload.get("attachment", False)),
            metadata=payload.get("metadata") or {},
            original_payload=payload,
            message_id=payload.get("message_id") or None,
            source_channel=payload.get("source_channel", "email"),
            assigned_to=assigned_to,
        )

        if request is not None:
            log_action(
                request,
                "EMAIL_RECEIVED",
                additional_data={
                    "email_id": email.id,
                    "sender_email": email.sender_email,
                    "subject": email.subject,
                },
            )

        classification = self.classifier.predict(email)
        features = classification.get("features") or self.processor.extract_features(email)
        classification_obj = EmailClassification.objects.create(
            email=email,
            category=classification["category"],
            confidence_score=classification["confidence_score"],
            model_name=classification.get("model_name", "heuristic-bert-adapter"),
            rationale=classification.get("rationale", ""),
            features=features,
        )

        response_data = self.generator.generate(
            email=email,
            category=classification_obj.category,
            confidence_score=classification_obj.confidence_score,
            features=features,
        )
        ai_response = AIResponse.objects.create(
            email=email,
            generated_text=response_data["generated_text"],
            subject=response_data["subject"],
            model_name=response_data.get("model_name", "heuristic-t5-adapter"),
            approved=False,
            dispatch_status="DRAFT",
            dispatched_to=email.sender_email,
        )

        should_auto_dispatch = (
            force_dispatch
            if force_dispatch is not None
            else (
                self.config.enabled
                and classification_obj.confidence_score >= self.config.auto_dispatch_threshold
                and not force_review
            )
        )
        should_escalate = (
            force_review
            or classification_obj.confidence_score < self.config.escalation_threshold
            or not should_auto_dispatch
        )

        email.confidence_score = classification_obj.confidence_score
        email.processed_at = timezone.now()
        email.auto_dispatch = bool(should_auto_dispatch)

        if should_auto_dispatch and not should_escalate:
            dispatch_result = self.dispatcher.dispatch(email, ai_response, dry_run=False)
            if dispatch_result.get("sent"):
                email.status = "REPLIED"
                email.replied_at = timezone.now()
                ai_response.approved = True
                ai_response.dispatch_status = "SENT"
                ai_response.dispatched_at = timezone.now()
                ai_response.save(update_fields=["approved", "dispatch_status", "dispatched_at", "updated_at"])
                if request is not None:
                    log_action(
                        request,
                        "EMAIL_DISPATCHED",
                        additional_data={
                            "email_id": email.id,
                            "simulated": dispatch_result.get("simulated", False),
                            "dispatch_log_id": dispatch_result.get("dispatch_log_id"),
                        },
                    )
            else:
                email.status = "FAILED"
                ai_response.dispatch_status = "FAILED"
                ai_response.dispatch_error = dispatch_result.get("error", "Dispatch failed")
                ai_response.save(update_fields=["dispatch_status", "dispatch_error", "updated_at"])
                if request is not None:
                    log_action(
                        request,
                        "EMAIL_DISPATCH_FAILED",
                        additional_data={
                            "email_id": email.id,
                            "error": dispatch_result.get("error"),
                        },
                    )
        else:
            email.status = "REVIEW"
            email.escalated_at = timezone.now()
            if assigned_to:
                email.assigned_to = assigned_to
            if request is not None:
                log_action(
                    request,
                    "EMAIL_REVIEW_REQUESTED",
                    additional_data={
                        "email_id": email.id,
                        "confidence": classification_obj.confidence_score,
                        "category": classification_obj.category,
                    },
                )

        email.save(
            update_fields=[
                "confidence_score",
                "processed_at",
                "auto_dispatch",
                "status",
                "replied_at",
                "escalated_at",
                "assigned_to",
            ]
        )

        return {
            "email": email,
            "classification": classification_obj,
            "response": ai_response,
            "dispatch_result": {
                "status": email.status,
                "auto_dispatch": should_auto_dispatch,
                "escalated": should_escalate,
            },
        }


class FeedbackService:
    @transaction.atomic
    def capture(self, *, email: Email, user, rating: int, comment: str = "") -> AI_Feedback:
        feedback = AI_Feedback.objects.create(
            email=email,
            user=user,
            rating=rating,
            comment=comment or "",
        )
        return feedback
