from django.urls import path
from apps.billing.views import SubscriptionAPIView

urlpatterns = [
    path('', SubscriptionAPIView.as_view(), name='subscription'),
]
