from django.contrib import admin

from .models import TrainingData


@admin.register(TrainingData)
class TrainingDataAdmin(admin.ModelAdmin):
    list_display = ("id", "expected_category", "anonymized", "pii_removed", "source", "created_at", "submitted_by")
    list_filter = ("expected_category", "anonymized", "pii_removed", "source")
    search_fields = ("input_email", "expected_response", "notes")
