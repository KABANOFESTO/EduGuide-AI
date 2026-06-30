from django.conf import settings
from django.db import models
from django.utils import timezone


class EmailPipelineConfig(models.Model):
    """Singleton configuration for the AI email pipeline."""

    name = models.CharField(max_length=100, unique=True, default="default")
    institution_name = models.CharField(max_length=255, default="University of Kigali")
    auto_dispatch_threshold = models.FloatField(default=0.82)
    escalation_threshold = models.FloatField(default=0.65)
    reviewer_email = models.EmailField(blank=True, default="")
    email_dispatch_mode = models.CharField(
        max_length=20,
        default="dry_run",
        choices=[
            ("dry_run", "Dry run"),
            ("smtp", "SMTP"),
            ("external_api", "External API"),
        ],
    )
    classifier_endpoint = models.URLField(blank=True, default="")
    generator_endpoint = models.URLField(blank=True, default="")
    dispatch_endpoint = models.URLField(blank=True, default="")
    reply_signature = models.TextField(
        blank=True,
        default="University of Kigali Automated Response System",
    )
    enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Email Pipeline Config"
        verbose_name_plural = "Email Pipeline Configs"

    def __str__(self):
        return f"{self.institution_name} pipeline config"

    @classmethod
    def get_solo(cls):
        config, _ = cls.objects.get_or_create(
            name="default",
            defaults={
                "institution_name": "University of Kigali",
                "auto_dispatch_threshold": getattr(
                    settings, "DEFAULT_AI_THRESHOLD", 0.82
                ),
                "escalation_threshold": getattr(
                    settings, "DEFAULT_ESCALATION_THRESHOLD", 0.65
                ),
                "email_dispatch_mode": getattr(
                    settings, "EMAIL_DISPATCH_MODE", "dry_run"
                ),
                "classifier_endpoint": getattr(
                    settings, "AI_CLASSIFIER_ENDPOINT", ""
                ),
                "generator_endpoint": getattr(
                    settings, "AI_GENERATOR_ENDPOINT", ""
                ),
                "dispatch_endpoint": getattr(
                    settings, "EMAIL_DISPATCH_ENDPOINT", ""
                ),
                "reply_signature": getattr(
                    settings, "EMAIL_PIPELINE_SIGNATURE", "University of Kigali Automated Response System"
                ),
            },
        )
        return config


class Email(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSED", "Processed"),
        ("REVIEW", "Needs Review"),
        ("REPLIED", "Replied"),
        ("FAILED", "Failed"),
    ]

    sender_name = models.CharField(max_length=255, blank=True)
    sender_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    attachment = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    original_payload = models.JSONField(default=dict, blank=True)
    message_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    source_channel = models.CharField(max_length=50, default="email")
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    escalated_at = models.DateTimeField(null=True, blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_emails",
    )
    confidence_score = models.FloatField(null=True, blank=True)
    auto_dispatch = models.BooleanField(default=False)

    class Meta:
        ordering = ["-received_at"]

    def __str__(self):
        return f"{self.subject} ({self.sender_email})"


class EmailClassification(models.Model):
    CATEGORY_CHOICES = [
        ("ADMISSION", "Admission inquiry"),
        ("FEES", "Fee and payment query"),
        ("REGISTRATION", "Course registration & academic calendar"),
        ("EXAM", "Examination and results inquiry"),
        ("ADMIN", "General administrative request"),
    ]

    email = models.OneToOneField(
        Email, on_delete=models.CASCADE, related_name="classification"
    )
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    confidence_score = models.FloatField()
    model_name = models.CharField(max_length=100, default="heuristic-bert-adapter")
    rationale = models.TextField(blank=True)
    features = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email.subject} - {self.category}"


class AIResponse(models.Model):
    DISPATCH_STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("QUEUED", "Queued"),
        ("SENT", "Sent"),
        ("FAILED", "Failed"),
    ]

    email = models.OneToOneField(Email, on_delete=models.CASCADE, related_name="ai_response")
    generated_text = models.TextField()
    subject = models.CharField(max_length=255, blank=True)
    model_name = models.CharField(max_length=100, default="heuristic-t5-adapter")
    approved = models.BooleanField(default=False)
    dispatch_status = models.CharField(
        max_length=20, choices=DISPATCH_STATUS_CHOICES, default="DRAFT"
    )
    dispatched_to = models.EmailField(blank=True, default="")
    dispatch_error = models.TextField(blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.subject or self.email.subject


class EmailReview(models.Model):
    REVIEW_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("EDITED", "Edited"),
    ]

    email = models.OneToOneField(Email, on_delete=models.CASCADE, related_name="review")
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_reviews",
    )
    corrected_response = models.TextField()
    review_status = models.CharField(
        max_length=20, choices=REVIEW_STATUS_CHOICES, default="PENDING"
    )
    reviewer_comment = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.email.subject}"


class AI_Feedback(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name="feedback")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="email_feedback"
    )
    rating = models.IntegerField(
        choices=[
            (1, "Very Bad"),
            (2, "Bad"),
            (3, "Average"),
            (4, "Good"),
            (5, "Excellent"),
        ]
    )
    comment = models.TextField(blank=True)
    feedback_source = models.CharField(max_length=50, default="staff")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback {self.rating} for {self.email.subject}"


class EmailDispatchLog(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name="dispatch_logs")
    response = models.ForeignKey(
        AIResponse, on_delete=models.SET_NULL, null=True, blank=True, related_name="dispatch_logs"
    )
    status = models.CharField(max_length=20, default="QUEUED")
    details = models.JSONField(default=dict, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email.subject} - {self.status}"
