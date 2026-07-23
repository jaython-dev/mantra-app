from django.contrib import admin
from apps.billing.models import SubscriptionPlan, Subscription, Payment


class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_days', 'price', 'currency', 'is_active')
    list_filter = ('is_active', 'currency')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'status', 'auto_renew')
    list_filter = ('status', 'auto_renew', 'plan')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'amount', 'currency', 'payment_provider', 'payment_status', 'payment_date')
    list_filter = ('payment_status', 'payment_provider', 'currency')
    search_fields = ('transaction_id', 'user__username', 'user__email')
    readonly_fields = ('payment_date', 'created_at', 'updated_at')


admin.site.register(SubscriptionPlan, SubscriptionPlanAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(Payment, PaymentAdmin)
