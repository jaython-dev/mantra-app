from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.billing.models import SubscriptionPlan, Subscription, Payment


@transaction.atomic
def create_subscription(user, plan_id: str, auto_renew: bool = True) -> Subscription:
    """
    Subscribes a user to a plan. Automatically cancels prior active subscriptions.
    """
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
    except SubscriptionPlan.DoesNotExist:
        raise ValidationError("Subscription plan not found or is inactive.")

    now = timezone.now()
    end_date = now + timedelta(days=plan.duration_days)

    # Deactivate existing active subscriptions
    Subscription.objects.filter(user=user, status='active').update(status='expired')

    subscription = Subscription.objects.create(
        user=user,
        plan=plan,
        start_date=now,
        end_date=end_date,
        status='active',
        auto_renew=auto_renew
    )
    return subscription


@transaction.atomic
def process_payment(user, subscription_id: str, amount: float, currency: str,
                    payment_provider: str, transaction_id: str, payment_status: str) -> Payment:
    """
    Processes and logs a transaction. Updates subscription status accordingly.
    """
    try:
        subscription = Subscription.objects.get(id=subscription_id, user=user)
    except Subscription.DoesNotExist:
        raise ValidationError("Subscription record not found for this user.")

    # Update subscription status according to payment status
    if payment_status == 'completed':
        subscription.status = 'active'
        subscription.save()
    elif payment_status == 'failed':
        subscription.status = 'canceled'
        subscription.save()

    # Create payment log
    payment = Payment.objects.create(
        user=user,
        subscription=subscription,
        amount=amount,
        currency=currency,
        payment_provider=payment_provider,
        transaction_id=transaction_id,
        payment_status=payment_status
    )
    return payment


def verify_payment_gateway_callback(provider: str, payload: dict) -> dict:
    """
    Modular hook verifying webhook/callback data.
    Future ready for Razorpay, Google Play, Apple In-App purchase verify checks.
    """
    if provider.lower() == 'razorpay':
        return _verify_razorpay(payload)
    else:
        raise ValidationError(f"Payment gateway provider '{provider}' is not supported.")


def _verify_razorpay(payload: dict) -> dict:
    """
    Razorpay specific field mapping mock logic.
    """
    # Exposing field names expected by DRF serializer
    transaction_id = payload.get('razorpay_payment_id')
    subscription_id = payload.get('subscription_id')
    status_raw = payload.get('status')
    
    payment_status = 'completed' if status_raw == 'captured' else 'failed'
    
    return {
        "transaction_id": transaction_id,
        "subscription_id": subscription_id,
        "payment_status": payment_status,
        "amount": payload.get('amount', 0.0),
        "currency": payload.get('currency', 'INR')
    }
