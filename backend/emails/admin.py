from django.contrib import admin

from .models import (
    AIResponse,
    AI_Feedback,
    Email,
    EmailClassification,
    EmailDispatchLog,
    EmailPipelineConfig,
    EmailReview,
)


@admin.register(EmailPipelineConfig)
class EmailPipelineConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "institution_name", "email_dispatch_mode", "auto_dispatch_threshold", "enabled", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ("subject", "sender_email", "status", "confidence_score", "received_at", "assigned_to")
    list_filter = ("status", "source_channel", "attachment")
    search_fields = ("subject", "sender_email", "sender_name")


@admin.register(EmailClassification)
class EmailClassificationAdmin(admin.ModelAdmin):
    list_display = ("email", "category", "confidence_score", "model_name", "created_at")
    list_filter = ("category", "model_name")


@admin.register(AIResponse)
class AIResponseAdmin(admin.ModelAdmin):
    list_display = ("email", "subject", "model_name", "approved", "dispatch_status", "generated_at")
    list_filter = ("approved", "dispatch_status", "model_name")


@admin.register(EmailReview)
class EmailReviewAdmin(admin.ModelAdmin):
    list_display = ("email", "reviewer", "review_status", "reviewed_at")
    list_filter = ("review_status",)


@admin.register(AI_Feedback)
class AI_FeedbackAdmin(admin.ModelAdmin):
    list_display = ("email", "user", "rating", "feedback_source", "created_at")
    list_filter = ("rating", "feedback_source")


@admin.register(EmailDispatchLog)
class EmailDispatchLogAdmin(admin.ModelAdmin):
    list_display = ("email", "status", "attempted_at")
    list_filter = ("status",)
