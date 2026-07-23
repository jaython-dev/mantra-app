from django.db import models
from django.conf import settings
from apps.core.models import BaseModel


class SubscriptionPlan(BaseModel):
    """
    Available subscription tiers.
    """
    name = models.CharField(max_length=255)
    duration_days = models.PositiveIntegerField(help_text="Plan duration in days")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.duration_days} days) - {self.price} {self.currency}"


class Subscription(BaseModel):
    """
    A user's subscription record.
    """
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('canceled', 'Canceled'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    auto_renew = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"


class Payment(BaseModel):
    """
    Logs payment history for subscriptions.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    payment_provider = models.CharField(
        max_length=100,
        help_text="e.g. Razorpay"
    )
    transaction_id = models.CharField(max_length=255, unique=True)
    payment_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.amount} {self.currency} ({self.payment_status})"
