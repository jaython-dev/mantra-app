import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestAccountsAPI:
    def test_register_user_success(self, api_client):
        url = reverse('register')
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "bio": "Mantra practitioner"
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        res_json = response.json()
        assert res_json['success'] is True
        assert 'token' in res_json['data']
        assert res_json['data']['user']['username'] == "newuser"

    def test_register_duplicate_username(self, api_client, create_user):
        create_user(username="existinguser")
        url = reverse('register')
        data = {
            "username": "existinguser",
            "email": "newuser@example.com",
            "password": "password123"
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        res_json = response.json()
        assert res_json['success'] is False
        assert 'username' in res_json['errors']

    def test_login_success(self, api_client, create_user):
        user = create_user(username="testuser", password="password123")
        url = reverse('login')
        data = {
            "username": "testuser",
            "password": "password123"
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['success'] is True
        assert 'token' in res_json['data']

    def test_login_fail(self, api_client):
        url = reverse('login')
        data = {
            "username": "nonexistent",
            "password": "wrongpassword"
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        res_json = response.json()
        assert res_json['success'] is False

    def test_get_profile(self, auth_client):
        url = reverse('profile')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['success'] is True
        assert res_json['data']['username'] == auth_client.user.username

    def test_update_profile(self, auth_client):
        url = reverse('profile')
        data = {"bio": "Updated bio text"}
        response = auth_client.put(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['success'] is True
        assert res_json['data']['bio'] == "Updated bio text"

    def test_change_password(self, auth_client):
        url = reverse('change-password')
        data = {
            "old_password": "password123",
            "new_password": "newpassword456"
        }
        response = auth_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['success'] is True
