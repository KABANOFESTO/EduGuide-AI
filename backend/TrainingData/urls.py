from django.urls import path

from .views import TrainingDataDetailView, TrainingDataListCreateView, TrainingDataSeedView

urlpatterns = [
    path("", TrainingDataListCreateView.as_view(), name="training-data-list"),
    path("seed/", TrainingDataSeedView.as_view(), name="training-data-seed"),
    path("<int:pk>/", TrainingDataDetailView.as_view(), name="training-data-detail"),
]
