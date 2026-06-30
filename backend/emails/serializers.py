from rest_framework import serializers

from authapi.models import User
from authapi.serializers import UserSerializer
from .models import (
    AIResponse,
    AI_Feedback,
    Email,
    EmailClassification,
    EmailDispatchLog,
    EmailPipelineConfig,
    EmailReview,
)
from .services import EmailPipelineService, FeedbackService


class EmailClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailClassification
        fields = "__all__"


class AIResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIResponse
        fields = "__all__"


class EmailReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewer_id = serializers.PrimaryKeyRelatedField(
        source="reviewer", queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = EmailReview
        fields = [
            "id",
            "email",
            "reviewer",
            "reviewer_id",
            "corrected_response",
            "review_status",
            "reviewer_comment",
            "reviewed_at",
        ]
        read_only_fields = ["id", "reviewed_at", "reviewer"]


class AIFeedbackSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source="user", queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = AI_Feedback
        fields = [
            "id",
            "email",
            "user",
            "user_id",
            "rating",
            "comment",
            "feedback_source",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "user"]


class EmailDispatchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailDispatchLog
        fields = "__all__"


class EmailPipelineConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailPipelineConfig
        fields = [
            "id",
            "name",
            "institution_name",
            "auto_dispatch_threshold",
            "escalation_threshold",
            "reviewer_email",
            "email_dispatch_mode",
            "classifier_endpoint",
            "generator_endpoint",
            "dispatch_endpoint",
            "reply_signature",
            "enabled",
            "updated_at",
            "created_at",
        ]
        read_only_fields = ["id", "updated_at", "created_at"]


class EmailSerializer(serializers.ModelSerializer):
    classification = EmailClassificationSerializer(read_only=True)
    ai_response = AIResponseSerializer(read_only=True)
    review = EmailReviewSerializer(read_only=True)
    feedback = AIFeedbackSerializer(many=True, read_only=True)
    dispatch_logs = EmailDispatchLogSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = Email
        fields = [
            "id",
            "sender_name",
            "sender_email",
            "subject",
            "body",
            "attachment",
            "metadata",
            "original_payload",
            "message_id",
            "source_channel",
            "received_at",
            "processed_at",
            "escalated_at",
            "replied_at",
            "status",
            "assigned_to",
            "confidence_score",
            "auto_dispatch",
            "classification",
            "ai_response",
            "review",
            "feedback",
            "dispatch_logs",
        ]
        read_only_fields = [
            "id",
            "received_at",
            "processed_at",
            "escalated_at",
            "replied_at",
            "status",
            "confidence_score",
            "auto_dispatch",
            "classification",
            "ai_response",
            "review",
            "feedback",
            "dispatch_logs",
        ]


class EmailProcessSerializer(serializers.Serializer):
    sender_name = serializers.CharField(required=False, allow_blank=True)
    sender_email = serializers.EmailField()
    subject = serializers.CharField(max_length=255)
    body = serializers.CharField()
    attachment = serializers.BooleanField(required=False, default=False)
    metadata = serializers.JSONField(required=False, default=dict)
    message_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    source_channel = serializers.CharField(required=False, default="email")
    assigned_to = serializers.IntegerField(required=False, allow_null=True)
    force_review = serializers.BooleanField(required=False, default=False)
    force_dispatch = serializers.BooleanField(required=False, allow_null=True)

    def validate(self, attrs):
        if not attrs.get("subject") and not attrs.get("body"):
            raise serializers.ValidationError("Either subject or body must be provided.")
        assigned_to_id = attrs.get("assigned_to")
        if assigned_to_id:
            from authapi.models import User

            if not User.objects.filter(pk=assigned_to_id).exists():
                raise serializers.ValidationError({"assigned_to": "Assigned user does not exist."})
        return attrs

    def create(self, validated_data):
        assigned_to_id = validated_data.pop("assigned_to", None)
        force_review = validated_data.pop("force_review", False)
        force_dispatch = validated_data.pop("force_dispatch", None)
        assigned_to = None
        if assigned_to_id:
            from authapi.models import User

            assigned_to = User.objects.filter(pk=assigned_to_id).first()

        service = EmailPipelineService()
        return service.process_email(
            validated_data,
            assigned_to=assigned_to,
            request=self.context.get("request"),
            force_review=force_review,
            force_dispatch=force_dispatch,
        )


class EmailFeedbackCreateSerializer(serializers.Serializer):
    email_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)
    feedback_source = serializers.CharField(required=False, default="staff")

    def create(self, validated_data):
        from .models import Email

        email = Email.objects.get(pk=validated_data["email_id"])
        feedback = FeedbackService().capture(
            email=email,
            user=self.context["request"].user,
            rating=validated_data["rating"],
            comment=validated_data.get("comment", ""),
        )
        if validated_data.get("feedback_source"):
            feedback.feedback_source = validated_data["feedback_source"]
            feedback.save(update_fields=["feedback_source"])
        return feedback


class EmailReviewCreateSerializer(serializers.Serializer):
    corrected_response = serializers.CharField()
    review_status = serializers.ChoiceField(
        choices=["APPROVED", "REJECTED", "EDITED"], default="APPROVED"
    )
    reviewer_comment = serializers.CharField(required=False, allow_blank=True)
    send_after_review = serializers.BooleanField(required=False, default=False)
