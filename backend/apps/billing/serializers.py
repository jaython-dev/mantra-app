from rest_framework import serializers
from apps.billing.models import SubscriptionPlan, Subscription, Payment


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'duration_days', 'price', 'currency', 'description', 'is_active']
        read_only_fields = ['id']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_price = serializers.DecimalField(source='plan.price', max_digits=10, decimal_places=2, read_only=True)
    plan_currency = serializers.CharField(source='plan.currency', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'plan_name', 'plan_price', 'plan_currency', 'start_date', 'end_date', 'status', 'auto_renew']
        read_only_fields = ['id', 'start_date', 'end_date', 'status']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'subscription', 'amount', 'currency', 'payment_provider', 'transaction_id', 'payment_status', 'payment_date']
        read_only_fields = ['id', 'payment_date']


class SubscribeRequestSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    auto_renew = serializers.BooleanField(default=True, required=False)


class PaymentRequestSerializer(serializers.Serializer):
    subscription_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=10, default='INR')
    payment_provider = serializers.CharField(max_length=100)
    transaction_id = serializers.CharField(max_length=255)
    payment_status = serializers.ChoiceField(choices=['completed', 'failed', 'pending'])


class WebhookCallbackSerializer(serializers.Serializer):
    provider = serializers.CharField(max_length=100)
    payload = serializers.JSONField()
