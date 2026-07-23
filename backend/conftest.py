import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def make_user(username="testuser", email="test@example.com", password="password123", **kwargs):
        User = get_user_model()
        return User.objects.create_user(username=username, email=email, password=password, **kwargs)
    return make_user

@pytest.fixture
def auth_client(api_client, create_user):
    user = create_user()
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client
