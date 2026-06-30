from django.conf import settings
from django.db import models


class TrainingData(models.Model):
    CATEGORY_CHOICES = [
        ("ADMISSION", "Admission inquiry"),
        ("FEES", "Fee and payment query"),
        ("REGISTRATION", "Course registration & academic calendar"),
        ("EXAM", "Examination and results inquiry"),
        ("ADMIN", "General administrative request"),
    ]

    input_email = models.TextField()
    expected_category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    expected_response = models.TextField()
    anonymized = models.BooleanField(default=True)
    pii_removed = models.BooleanField(default=True)
    source = models.CharField(max_length=50, default="manual_annotation")
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="training_data_submissions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.expected_category} training sample #{self.pk or 'new'}"
