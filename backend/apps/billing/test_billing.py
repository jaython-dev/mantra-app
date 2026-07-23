import pytest
from django.urls import reverse
from rest_framework import status
from apps.billing.models import SubscriptionPlan, Subscription, Payment


@pytest.fixture
def active_plan(db):
    return SubscriptionPlan.objects.create(
        name="Quarterly Plan",
        duration_days=90,
        price=299.00,
        currency="INR",
        description="Premium Gita Audiobook 90 Days Access",
        is_active=True
    )


@pytest.mark.django_db
class TestBillingAPI:
    def test_list_plans(self, api_client, active_plan):
        url = reverse('plan-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert len(res_json['data']) == 1
        assert res_json['data'][0]['name'] == "Quarterly Plan"

    def test_subscribe_to_plan(self, auth_client, active_plan):
        url = reverse('subscription')
        data = {"plan_id": active_plan.id}
        response = auth_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        res_json = response.json()
        assert res_json['data']['plan'] == str(active_plan.id)
        assert res_json['data']['status'] == "active"

    def test_get_current_subscription(self, auth_client, active_plan):
        # First subscribe
        url_sub = reverse('subscription')
        auth_client.post(url_sub, {"plan_id": active_plan.id}, format='json')
        
        # Then retrieve status
        response = auth_client.get(url_sub)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['data']['status'] == "active"
        assert res_json['data']['plan_name'] == "Quarterly Plan"

    def test_post_payment_record(self, auth_client, active_plan):
        # Create a subscription first
        url_sub = reverse('subscription')
        sub_resp = auth_client.post(url_sub, {"plan_id": active_plan.id}, format='json')
        res_json_sub = sub_resp.json()
        sub_id = res_json_sub['data']['id']
        
        url_pay = reverse('payment-log')
        data = {
            "subscription_id": sub_id,
            "amount": 299.00,
            "currency": "INR",
            "payment_provider": "Razorpay",
            "transaction_id": "pay_tx_12345",
            "payment_status": "completed"
        }
        response = auth_client.post(url_pay, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        res_json = response.json()
        assert res_json['data']['payment_status'] == "completed"
        assert res_json['data']['transaction_id'] == "pay_tx_12345"

    def test_razorpay_webhook_mock(self, api_client, create_user, active_plan):
        # Setup subscription
        user = create_user(username="webhookuser")
        sub = Subscription.objects.create(
            user=user,
            plan=active_plan,
            start_date=timezone_now_fallback(),
            end_date=timezone_now_fallback(),
            status='active'
        )
        
        url = reverse('payment-webhook')
        data = {
            "provider": "Razorpay",
            "payload": {
                "razorpay_payment_id": "pay_web_9988",
                "subscription_id": str(sub.id),
                "status": "captured",
                "amount": 299.00,
                "currency": "INR"
            }
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert "verified successfully" in res_json['data']['detail']
        
        # Verify Payment logged
        assert Payment.objects.filter(transaction_id="pay_web_9988").exists()


def timezone_now_fallback():
    from django.utils import timezone
    return timezone.now()
