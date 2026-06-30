from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status, views
from rest_framework.response import Response

from authapi.permissions import IsAdmin, IsAdminOrReviewerOrStaff
from auditLog.audit_log_utils import log_action
from .models import TrainingData
from .serializers import TrainingDataSerializer


class TrainingDataListCreateView(generics.ListCreateAPIView):
    queryset = TrainingData.objects.select_related("submitted_by").all()
    serializer_class = TrainingDataSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReviewerOrStaff]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["expected_category", "anonymized", "pii_removed", "source"]
    search_fields = ["input_email", "expected_response", "notes"]
    ordering_fields = ["created_at", "expected_category"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        instance = serializer.save(submitted_by=self.request.user)
        log_action(
            self.request,
            "TRAINING_DATA_CREATED",
            additional_data={
                "training_data_id": instance.id,
                "category": instance.expected_category,
                "source": instance.source,
            },
        )


class TrainingDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingData.objects.select_related("submitted_by").all()
    serializer_class = TrainingDataSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class TrainingDataSeedView(views.APIView):
    """Quick utility for seeding sanitized samples from the model pipeline."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        payload = request.data if isinstance(request.data, list) else [request.data]
        created = []
        for item in payload:
            serializer = TrainingDataSerializer(data=item)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(submitted_by=request.user)
            created.append(TrainingDataSerializer(instance).data)
            log_action(
                request,
                "TRAINING_DATA_CREATED",
                additional_data={
                    "training_data_id": instance.id,
                    "category": instance.expected_category,
                    "seeded": True,
                },
            )
        return Response({"created": created}, status=status.HTTP_201_CREATED)
