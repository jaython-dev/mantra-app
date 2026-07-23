from django.urls import path
from apps.billing.views import SubscriptionPlanListAPIView

urlpatterns = [
    path('', SubscriptionPlanListAPIView.as_view(), name='plan-list'),
]
