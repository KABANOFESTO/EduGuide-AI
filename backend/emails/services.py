import logging
import email as email_module
import imaplib
import re
from dataclasses import dataclass
from html import unescape
from html.parser import HTMLParser
from email.header import decode_header
from email.utils import parseaddr
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


def _normalize_sender_name(sender_name: str, sender_email: str) -> str:
    cleaned = _decode_header_value(sender_name)
    if cleaned:
        return cleaned
    return _safe_email_name(sender_email)


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

    def dispatch(
        self,
        email: Email,
        response: AIResponse,
        *,
        dry_run: bool = False,
        force_live: bool = False,
    ) -> dict[str, Any]:
        recipient = email.sender_email
        subject = response.subject or f"Re: {email.subject}"
        message = response.generated_text
        configured_mode = self.config.email_dispatch_mode
        dispatch_mode = "smtp" if force_live and configured_mode == "dry_run" else configured_mode
        effective_dry_run = dry_run or (dispatch_mode == "dry_run" and not force_live)

        dispatch_log = EmailDispatchLog.objects.create(
            email=email,
            response=response,
            status="QUEUED" if effective_dry_run else "SENDING",
            details={
                "dispatch_mode": dispatch_mode,
                "configured_mode": configured_mode,
                "dry_run": effective_dry_run,
                "force_live": force_live,
            },
        )

        if effective_dry_run:
            dispatch_log.status = "SENT"
            dispatch_log.details["simulated"] = True
            dispatch_log.save(update_fields=["status", "details"])
            return {"sent": True, "simulated": True, "dispatch_log_id": dispatch_log.id}

        try:
            if dispatch_mode == "smtp":
                if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
                    raise ValueError(
                        "SMTP dispatch requires EMAIL_HOST_USER and EMAIL_HOST_PASSWORD to be configured."
                    )
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


def _decode_header_value(value: str | None) -> str:
    if not value:
        return ""

    decoded_parts: list[str] = []
    for part, encoding in decode_header(value):
        if isinstance(part, bytes):
            decoded_parts.append(part.decode(encoding or "utf-8", errors="replace"))
        else:
            decoded_parts.append(part)
    return "".join(decoded_parts).strip()


class _PlainTextHTMLParser(HTMLParser):
    BLOCK_TAGS = {
        "p",
        "div",
        "section",
        "article",
        "header",
        "footer",
        "aside",
        "main",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody",
        "tfoot",
        "li",
        "ul",
        "ol",
        "br",
        "hr",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return
        if tag == "li":
            self.parts.append("\n- ")
        elif tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style"} and self._skip_depth:
            self._skip_depth -= 1
            return
        if self._skip_depth:
            return
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._skip_depth:
            return
        self.parts.append(data)

    def get_text(self) -> str:
        text = unescape("".join(self.parts))
        text = re.sub(r"\r", "", text)
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]{2,}", " ", text)
        return text.strip()


def _html_to_text(text: str) -> str:
    parser = _PlainTextHTMLParser()
    parser.feed(text or "")
    parser.close()
    result = parser.get_text()
    if result:
        return result
    fallback = re.sub(r"<[^>]+>", " ", text or "")
    fallback = unescape(fallback)
    fallback = re.sub(r"\s+", " ", fallback).strip()
    return fallback


def _extract_message_body(message) -> tuple[str, bool]:
    body_text: list[str] = []
    has_attachment = False

    if message.is_multipart():
        for part in message.walk():
            content_disposition = (part.get_content_disposition() or "").lower()
            if content_disposition == "attachment" or part.get_filename():
                has_attachment = True
                continue

            content_type = (part.get_content_type() or "").lower()
            if content_type not in {"text/plain", "text/html"}:
                continue

            payload = part.get_payload(decode=True)
            if not payload:
                continue

            charset = part.get_content_charset() or "utf-8"
            try:
                text = payload.decode(charset, errors="replace")
            except LookupError:
                text = payload.decode("utf-8", errors="replace")

            if content_type == "text/html":
                text = _html_to_text(text)
            body_text.append(text.strip())
    else:
        payload = message.get_payload(decode=True)
        if payload:
            charset = message.get_content_charset() or "utf-8"
            try:
                text = payload.decode(charset, errors="replace")
            except LookupError:
                text = payload.decode("utf-8", errors="replace")
        else:
            text = message.get_payload() or ""
        if message.get_content_type() == "text/html":
            text = _html_to_text(text)
        body_text.append(text.strip())

    body = "\n\n".join([part for part in body_text if part]).strip()
    return body, has_attachment


class MailboxSyncService:
    def __init__(self, config: EmailPipelineConfig | None = None):
        self.config = config or EmailPipelineConfig.get_solo()
        self.imap_host = getattr(settings, "INBOUND_EMAIL_HOST", "").strip()
        self.imap_port = int(getattr(settings, "INBOUND_EMAIL_PORT", 993) or 993)
        self.imap_user = getattr(settings, "INBOUND_EMAIL_USER", "").strip()
        self.imap_password = getattr(settings, "INBOUND_EMAIL_PASSWORD", "")
        self.imap_folder = getattr(settings, "INBOUND_EMAIL_FOLDER", "INBOX").strip() or "INBOX"
        self.imap_use_ssl = bool(getattr(settings, "INBOUND_EMAIL_USE_SSL", True))
        self.source_channel = getattr(settings, "INBOUND_EMAIL_SOURCE_CHANNEL", "imap").strip() or "imap"

    def is_configured(self) -> bool:
        return bool(self.imap_host and self.imap_user and self.imap_password)

    def sync(self, *, limit: int = 25, request=None) -> dict[str, Any]:
        if not self.is_configured():
            return {
                "configured": False,
                "imported_count": 0,
                "skipped_count": 0,
                "processed_count": 0,
                "message": "Inbound mailbox sync is not configured.",
            }

        connection = None
        imported = 0
        skipped = 0
        processed = 0
        imported_emails: list[int] = []
        skipped_messages: list[str] = []

        try:
            connection = (
                imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
                if self.imap_use_ssl
                else imaplib.IMAP4(self.imap_host, self.imap_port)
            )
            connection.login(self.imap_user, self.imap_password)
            connection.select(self.imap_folder)

            _, search_data = connection.search(None, "UNSEEN")
            message_ids = list((search_data[0] or b"").split())
            if limit > 0:
                message_ids = message_ids[-limit:]

            for message_id in message_ids:
                processed += 1
                raw_id = message_id.decode("utf-8", errors="ignore")
                try:
                    _, fetch_data = connection.fetch(message_id, "(RFC822)")
                    raw_message = fetch_data[0][1]
                    parsed = email_module.message_from_bytes(raw_message)
                    header_message_id = (parsed.get("Message-ID") or "").strip()
                    stable_message_id = header_message_id or f"imap:{self.imap_user}:{raw_id}"

                    if Email.objects.filter(message_id=stable_message_id).exists():
                        skipped += 1
                        skipped_messages.append(stable_message_id)
                        connection.store(message_id, "+FLAGS", "\\Seen")
                        continue

                    raw_sender_name, sender_email = parseaddr(parsed.get("From", ""))
                    sender_name = _normalize_sender_name(raw_sender_name, sender_email)
                    subject = _decode_header_value(parsed.get("Subject", "")) or "(No subject)"
                    body, has_attachment = _extract_message_body(parsed)
                    received_date = _decode_header_value(parsed.get("Date", ""))

                    payload = {
                        "sender_name": sender_name or "",
                        "sender_email": sender_email or self.imap_user,
                        "subject": subject,
                        "body": body or subject,
                        "attachment": has_attachment,
                        "metadata": {
                            "imap_folder": self.imap_folder,
                            "imap_uid": raw_id,
                            "imap_host": self.imap_host,
                            "message_date": received_date,
                            "headers": {
                                "from": parsed.get("From", ""),
                                "to": parsed.get("To", ""),
                                "cc": parsed.get("Cc", ""),
                            },
                        },
                        "original_payload": {
                            "raw_headers": dict(parsed.items()),
                            "source": "imap",
                        },
                        "message_id": stable_message_id,
                        "source_channel": self.source_channel,
                    }

                    result = EmailPipelineService().process_email(payload, request=request)
                    imported += 1
                    imported_emails.append(result["email"].id)
                    connection.store(message_id, "+FLAGS", "\\Seen")
                except Exception as exc:
                    skipped += 1
                    skipped_messages.append(f"{raw_id}: {exc}")

            return {
                "configured": True,
                "imported_count": imported,
                "skipped_count": skipped,
                "processed_count": processed,
                "imported_email_ids": imported_emails,
                "skipped_messages": skipped_messages[:20],
                "mailbox": self.imap_folder,
            }
        finally:
            if connection is not None:
                try:
                    connection.logout()
                except Exception:
                    pass


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
