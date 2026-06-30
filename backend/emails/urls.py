from django.urls import path

from .views import (
    AIResponseListView,
    EmailClassificationListView,
    EmailDashboardView,
    EmailDetailView,
    EmailDispatchLogListView,
    EmailDispatchView,
    EmailFeedbackCreateView,
    EmailListView,
    EmailProcessView,
    HealthCheckView,
    EmailReviewCreateView,
    PipelineConfigView,
)

urlpatterns = [
    path("", EmailListView.as_view(), name="email-list"),
    path("process/", EmailProcessView.as_view(), name="email-process"),
    path("dashboard/", EmailDashboardView.as_view(), name="email-dashboard"),
    path("config/", PipelineConfigView.as_view(), name="email-pipeline-config"),
    path("health/", HealthCheckView.as_view(), name="email-health"),
    path("classifications/", EmailClassificationListView.as_view(), name="email-classification-list"),
    path("responses/", AIResponseListView.as_view(), name="ai-response-list"),
    path("dispatch-logs/", EmailDispatchLogListView.as_view(), name="dispatch-log-list"),
    path("<int:pk>/", EmailDetailView.as_view(), name="email-detail"),
    path("<int:pk>/feedback/", EmailFeedbackCreateView.as_view(), name="email-feedback"),
    path("<int:pk>/review/", EmailReviewCreateView.as_view(), name="email-review"),
    path("<int:pk>/dispatch/", EmailDispatchView.as_view(), name="email-dispatch"),
]
