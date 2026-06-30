from rest_framework import serializers

from .models import TrainingData


class TrainingDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingData
        fields = [
            "id",
            "input_email",
            "expected_category",
            "expected_response",
            "anonymized",
            "pii_removed",
            "source",
            "notes",
            "metadata",
            "submitted_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "submitted_by"]
