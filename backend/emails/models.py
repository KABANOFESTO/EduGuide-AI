from django.db import models
from django.contrib.auth.models import User


class Email(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSED", "Processed"),
        ("REVIEW", "Needs Review"),
        ("REPLIED", "Replied"),
    ]

    sender_email = models.EmailField()

    subject = models.CharField(max_length=255)

    body = models.TextField()

    attachment = models.BooleanField(default=False)

    received_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.subject


class EmailReview(models.Model):

    email = models.OneToOneField(Email, on_delete=models.CASCADE)

    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)

    corrected_response = models.TextField()

    review_status = models.CharField(max_length=20, default="PENDING")

    reviewed_at = models.DateTimeField(auto_now_add=True)


class AI_Feedback(models.Model):

    email = models.ForeignKey(Email, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

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

    created_at = models.DateTimeField(auto_now_add=True)


class EmailClassification(models.Model):
    CATEGORY_CHOICES = [
        ("ADMISSION", "Admission inquiry"),
        ("FEES", "Fee and payment query"),
        ("REGISTRATION", "Course registration & academic calendar"),
        ("EXAM", "Examination and results inquiry"),
        ("ADMIN", "General administrative request"),
    ]

    email = models.OneToOneField(Email, on_delete=models.CASCADE)

    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)

    confidence_score = models.FloatField()

    model_name = models.CharField(max_length=100, default="BERT")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email.subject} - {self.category}"


class AIResponse(models.Model):
    email = models.OneToOneField(Email, on_delete=models.CASCADE)

    generated_text = models.TextField()

    model_name = models.CharField(max_length=100, default="T5")

    approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email.subject
