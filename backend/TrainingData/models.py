from django.db import models


# Create your models here.
class TrainingData(models.Model):

    input_email = models.TextField()

    expected_category = models.CharField(max_length=100)

    expected_response = models.TextField()

    anonymized = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
