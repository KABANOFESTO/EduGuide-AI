from django.db.models import Avg, Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status, views
from rest_framework.response import Response

from authapi.permissions import IsAdmin, IsAdminOrReviewerOrStaff, IsReviewer, IsStaff
from auditLog.audit_log_utils import log_action
from .models import AIResponse, AI_Feedback, Email, EmailClassification, EmailDispatchLog, EmailPipelineConfig, EmailReview
from .serializers import (
    AIFeedbackSerializer,
    AIResponseSerializer,
    EmailClassificationSerializer,
    EmailDispatchLogSerializer,
    EmailFeedbackCreateSerializer,
    EmailPipelineConfigSerializer,
    EmailProcessSerializer,
    EmailReviewCreateSerializer,
    EmailReviewSerializer,
    EmailSerializer,
)
from .services import EmailDispatchService


class EmailListView(generics.ListAPIView):
    queryset = Email.objects.select_related(
        "assigned_to", "classification", "ai_response", "review"
    ).prefetch_related("feedback", "dispatch_logs")
    serializer_class = EmailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["status", "assigned_to", "attachment", "source_channel"]
    search_fields = ["sender_email", "sender_name", "subject", "body"]
    ordering_fields = ["received_at", "processed_at", "confidence_score"]
    ordering = ["-received_at"]


class EmailDetailView(generics.RetrieveAPIView):
    queryset = Email.objects.select_related(
        "assigned_to", "classification", "ai_response", "review"
    ).prefetch_related("feedback", "dispatch_logs")
    serializer_class = EmailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]


class EmailProcessView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]

    def post(self, request):
        serializer = EmailProcessSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        email = result["email"]
        log_action(
            request,
            "EMAIL_CLASSIFIED",
            additional_data={
                "email_id": email.id,
                "category": result["classification"].category,
                "confidence": result["classification"].confidence_score,
            },
        )
        return Response(
            {
                "message": "Email processed successfully.",
                "email": EmailSerializer(email).data,
                "classification": {
                    "category": result["classification"].category,
                    "confidence_score": result["classification"].confidence_score,
                    "model_name": result["classification"].model_name,
                    "rationale": result["classification"].rationale,
                    "features": result["classification"].features,
                },
                "response": AIResponseSerializer(result["response"]).data,
                "dispatch": result["dispatch_result"],
            },
            status=status.HTTP_201_CREATED,
        )


class EmailFeedbackCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]

    def post(self, request, pk):
        serializer = EmailFeedbackCreateSerializer(
            data={**request.data, "email_id": pk}, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save()
        log_action(
            request,
            "EMAIL_FEEDBACK_CAPTURED",
            target_user=request.user,
            additional_data={
                "email_id": pk,
                "rating": feedback.rating,
                "feedback_source": feedback.feedback_source,
            },
        )
        return Response(AIFeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)


class EmailReviewCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReviewer]

    def post(self, request, pk):
        serializer = EmailReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = Email.objects.get(pk=pk)
        review, _ = EmailReview.objects.update_or_create(
            email=email,
            defaults={
                "reviewer": request.user,
                "corrected_response": serializer.validated_data["corrected_response"],
                "review_status": serializer.validated_data["review_status"],
                "reviewer_comment": serializer.validated_data.get("reviewer_comment", ""),
            },
        )

        response_obj, _ = AIResponse.objects.get_or_create(
            email=email,
            defaults={
                "generated_text": serializer.validated_data["corrected_response"],
                "subject": f"Re: {email.subject}",
            },
        )
        response_obj.generated_text = serializer.validated_data["corrected_response"]
        response_obj.approved = True
        response_obj.dispatch_status = "QUEUED"
        response_obj.save(update_fields=["generated_text", "approved", "dispatch_status", "updated_at"])

        email.status = "PROCESSED"
        email.assigned_to = request.user
        email.save(update_fields=["status", "assigned_to"])

        dispatch_result = None
        if serializer.validated_data.get("send_after_review"):
            dispatch_result = EmailDispatchService().dispatch(email, response_obj, dry_run=False)
            if dispatch_result.get("sent"):
                email.status = "REPLIED"
                email.replied_at = timezone.now()
                email.save(update_fields=["status", "replied_at"])
                response_obj.dispatch_status = "SENT"
                response_obj.dispatched_at = timezone.now()
                response_obj.save(update_fields=["dispatch_status", "dispatched_at", "updated_at"])
            else:
                response_obj.dispatch_status = "FAILED"
                response_obj.dispatch_error = dispatch_result.get("error", "Dispatch failed")
                response_obj.save(update_fields=["dispatch_status", "dispatch_error", "updated_at"])

        log_action(
            request,
            "EMAIL_REVIEWED",
            additional_data={
                "email_id": email.id,
                "review_status": review.review_status,
                "send_after_review": serializer.validated_data.get("send_after_review", False),
            },
        )

        return Response(
            {
                "review": EmailReviewSerializer(review).data,
                "response": AIResponseSerializer(response_obj).data,
                "dispatch": dispatch_result,
                "email": EmailSerializer(email).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailDispatchView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]

    def post(self, request, pk):
        email = Email.objects.get(pk=pk)
        response_obj = getattr(email, "ai_response", None)
        if response_obj is None:
            return Response(
                {"error": "No AI response exists for this email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dispatch_result = EmailDispatchService().dispatch(email, response_obj, dry_run=False)
        if dispatch_result.get("sent"):
            email.status = "REPLIED"
            email.replied_at = timezone.now()
            email.save(update_fields=["status", "replied_at"])
            response_obj.dispatch_status = "SENT"
            response_obj.dispatched_at = timezone.now()
            response_obj.save(update_fields=["dispatch_status", "dispatched_at", "updated_at"])
            log_action(
                request,
                "EMAIL_REPLIED",
                additional_data={"email_id": email.id, "dispatch_log_id": dispatch_result.get("dispatch_log_id")},
            )
        else:
            email.status = "FAILED"
            email.save(update_fields=["status"])
            response_obj.dispatch_status = "FAILED"
            response_obj.dispatch_error = dispatch_result.get("error", "Dispatch failed")
            response_obj.save(update_fields=["dispatch_status", "dispatch_error", "updated_at"])
            log_action(
                request,
                "EMAIL_DISPATCH_FAILED",
                additional_data={
                    "email_id": email.id,
                    "error": dispatch_result.get("error"),
                },
            )

        return Response(
            {
                "email": EmailSerializer(email).data,
                "response": AIResponseSerializer(response_obj).data,
                "dispatch": dispatch_result,
            }
        )


class EmailClassificationListView(generics.ListAPIView):
    queryset = EmailClassification.objects.select_related("email").all()
    serializer_class = EmailClassificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["category", "model_name"]
    ordering_fields = ["created_at", "confidence_score"]
    ordering = ["-created_at"]


class AIResponseListView(generics.ListAPIView):
    queryset = AIResponse.objects.select_related("email").all()
    serializer_class = AIResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["approved", "dispatch_status", "model_name"]
    ordering_fields = ["generated_at", "dispatched_at"]
    ordering = ["-generated_at"]


class EmailDispatchLogListView(generics.ListAPIView):
    queryset = EmailDispatchLog.objects.select_related("email", "response").all()
    serializer_class = EmailDispatchLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["attempted_at"]
    ordering = ["-attempted_at"]


class PipelineConfigView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        config = EmailPipelineConfig.get_solo()
        return Response(EmailPipelineConfigSerializer(config).data)

    def put(self, request):
        config = EmailPipelineConfig.get_solo()
        serializer = EmailPipelineConfigSerializer(config, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_action(
            request,
            "PIPELINE_CONFIG_UPDATED",
            additional_data={"config_id": config.id},
        )
        return Response(serializer.data)

    def patch(self, request):
        config = EmailPipelineConfig.get_solo()
        serializer = EmailPipelineConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_action(
            request,
            "PIPELINE_CONFIG_UPDATED",
            additional_data={"config_id": config.id, "partial": True},
        )
        return Response(serializer.data)


class EmailDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]

    def get(self, request):
        total = Email.objects.count()
        counts = Email.objects.values("status").annotate(total=Count("id"))
        by_category = (
            EmailClassification.objects.values("category").annotate(total=Count("id")).order_by("category")
        )
        average_confidence = EmailClassification.objects.aggregate(avg=Avg("confidence_score"))["avg"] or 0
        feedback_avg = AI_Feedback.objects.aggregate(avg=Avg("rating"))["avg"] or 0
        queue_size = Email.objects.filter(status="REVIEW").count()
        replied = Email.objects.filter(status="REPLIED").count()

        return Response(
            {
                "total_emails": total,
                "status_breakdown": list(counts),
                "category_breakdown": list(by_category),
                "average_confidence": round(float(average_confidence), 3) if average_confidence else 0,
                "average_feedback_rating": round(float(feedback_avg), 2) if feedback_avg else 0,
                "review_queue": queue_size,
                "replied": replied,
                "generated_at": timezone.now(),
            }
        )


class HealthCheckView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        config = EmailPipelineConfig.get_solo()
        return Response(
            {
                "status": "ok",
                "service": "EduGuide AI backend",
                "pipeline_enabled": config.enabled,
                "dispatch_mode": config.email_dispatch_mode,
                "timestamp": timezone.now(),
            }
        )
