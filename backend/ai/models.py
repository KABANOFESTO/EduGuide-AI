from django.db import models
from emails.models import Email


class EmailClassification(models.Model):
    CATEGORY_CHOICES = [
        ("ADMISSION", "Admission inquiry"),
        ("FEES", "Fee and payment query"),
        ("REGISTRATION", "Course registration & academic calendar"),
        ("EXAM", "Examination and results inquiry"),
        ("ADMIN", "General administrative request"),
    ]

    email = models.OneToOneField(
        Email,
        on_delete=models.CASCADE
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    confidence_score = models.FloatField()

    model_name = models.CharField(
        max_length=100,
        default="BERT"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.email.subject} - {self.category}"


class AIResponse(models.Model):
    email = models.OneToOneField(
        Email,
        on_delete=models.CASCADE
    )

    generated_text = models.TextField()

    model_name = models.CharField(
        max_length=100,
        default="T5"
    )

    approved = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.email.subject