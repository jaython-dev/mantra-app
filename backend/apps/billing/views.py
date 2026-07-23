from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.billing.models import SubscriptionPlan, Subscription, Payment
from apps.billing.serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
    PaymentSerializer,
    SubscribeRequestSerializer,
    PaymentRequestSerializer,
    WebhookCallbackSerializer,
)
from apps.billing.services import (
    create_subscription,
    process_payment,
    verify_payment_gateway_callback,
)


class SubscriptionPlanListAPIView(APIView):
    """
    List all active subscription plans.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: SubscriptionPlanSerializer(many=True)})
    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by('duration_days')
        serializer = SubscriptionPlanListAPIView.serializer_class = SubscriptionPlanSerializer
        return Response(serializer(plans, many=True).data)


class SubscriptionAPIView(APIView):
    """
    Manage user subscriptions.
    GET: Retrieve current active subscription details.
    POST: Subscribe to a new plan.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: SubscriptionSerializer})
    def get(self, request):
        # Fetch the most recent active/expired subscription for the user
        subscription = Subscription.objects.filter(user=request.user).order_by('-created_at').first()
        if not subscription:
            return Response({"detail": "No subscription found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)

    @extend_schema(
        request=SubscribeRequestSerializer,
        responses={201: SubscriptionSerializer}
    )
    def post(self, request):
        serializer = SubscribeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Call service to subscribe user
        subscription = create_subscription(
            user=request.user,
            plan_id=str(serializer.validated_data['plan_id']),
            auto_renew=serializer.validated_data.get('auto_renew', True)
        )
        
        return Response(SubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)


class PaymentAPIView(APIView):
    """
    Manage payment logs.
    GET: Retrieve payment history for user.
    POST: Log a client-side transaction (e.g. from Razorpay check out).
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: PaymentSerializer(many=True)})
    def get(self, request):
        payments = Payment.objects.filter(user=request.user).order_by('-payment_date')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=PaymentRequestSerializer,
        responses={201: PaymentSerializer}
    )
    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Call service to log payment
        payment = process_payment(
            user=request.user,
            subscription_id=str(serializer.validated_data['subscription_id']),
            amount=serializer.validated_data['amount'],
            currency=serializer.validated_data['currency'],
            payment_provider=serializer.validated_data['payment_provider'],
            transaction_id=serializer.validated_data['transaction_id'],
            payment_status=serializer.validated_data['payment_status']
        )
        
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentWebhookAPIView(APIView):
    """
    Endpoint for verifying and processing background webhook events.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=WebhookCallbackSerializer,
        responses={200: OpenApiResponse(description="Webhook processed successfully.")}
    )
    def post(self, request):
        serializer = WebhookCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        provider = serializer.validated_data['provider']
        payload = serializer.validated_data['payload']
        
        # Resolve user dynamically from webhook context or use standard auth
        # Since webhooks are server-to-server, we extract transaction details and process
        verified_data = verify_payment_gateway_callback(provider, payload)
        
        # Find subscription
        subscription = get_object_or_404(Subscription, id=verified_data['subscription_id'])
        
        # Log payment in background
        payment = process_payment(
            user=subscription.user,
            subscription_id=str(subscription.id),
            amount=verified_data['amount'],
            currency=verified_data['currency'],
            payment_provider=provider,
            transaction_id=verified_data['transaction_id'],
            payment_status=verified_data['payment_status']
        )
        
        return Response({
            "detail": "Webhook received and verified successfully.",
            "payment_id": payment.id
        }, status=status.HTTP_200_OK)
