from django.urls import path
from apps.billing.views import PaymentAPIView, PaymentWebhookAPIView

urlpatterns = [
    path('', PaymentAPIView.as_view(), name='payment-log'),
    path('webhook/', PaymentWebhookAPIView.as_view(), name='payment-webhook'),
]
