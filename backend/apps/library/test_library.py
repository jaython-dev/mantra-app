import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.library.models import Category, Book, Chapter, Mantra, Audio
from apps.billing.models import Subscription, SubscriptionPlan
from apps.library.services import create_category, create_book, create_chapter, create_mantra, create_audio


@pytest.fixture
def test_category(db):
    icon_file = SimpleUploadedFile("icon.png", b"dummy_content", content_type="image/png")
    return create_category(name="Devotional", icon=icon_file, display_order=1)


@pytest.fixture
def free_book(db, test_category):
    cover_file = SimpleUploadedFile("cover.png", b"dummy_content", content_type="image/png")
    return create_book(
        category=test_category,
        title="Gita Mahatmya",
        description="Glories of Gita",
        author="Vyasa",
        cover_image=cover_file,
        language="Sanskrit",
        estimated_duration=3600,
        display_order=1,
        is_published=True,
        is_premium=False
    )


@pytest.fixture
def premium_book(db, test_category):
    cover_file = SimpleUploadedFile("cover_prem.png", b"dummy_content", content_type="image/png")
    return create_book(
        category=test_category,
        title="Premium Upanishads",
        description="Premium Upanishad Audiobooks",
        author="Sages",
        cover_image=cover_file,
        language="Sanskrit",
        estimated_duration=7200,
        display_order=2,
        is_published=True,
        is_premium=True
    )


@pytest.fixture
def free_chapter(db, free_book):
    return create_chapter(
        book=free_book,
        title="Chapter One",
        chapter_number=1,
        description="Intro to Gita",
        thumbnail=None,
        display_order=1,
        estimated_duration=600,
        is_published=True
    )


@pytest.fixture
def premium_chapter(db, premium_book):
    return create_chapter(
        book=premium_book,
        title="Premium Chapter One",
        chapter_number=1,
        description="Advanced Upanishad",
        thumbnail=None,
        display_order=1,
        estimated_duration=1200,
        is_published=True
    )


@pytest.fixture
def premium_mantra(db, premium_chapter):
    return create_mantra(
        chapter=premium_chapter,
        title="Shanti Mantra",
        sanskrit_text="ॐ शान्तिः शान्तिः शान्तिः",
        gujarati_text="ઓમ શાંતિ શાંતિ શાંતિ",
        hindi_text="ओम शांति शांति शांति",
        english_text="Om peace peace peace",
        meaning="Universal peace prayer",
        notes="Recited at beginning and end",
        display_order=1
    )


@pytest.fixture
def active_subscription(db, auth_client):
    plan = SubscriptionPlan.objects.create(
        name="Yearly Plan",
        duration_days=365,
        price=999.00,
        is_active=True
    )
    return Subscription.objects.create(
        user=auth_client.user,
        plan=plan,
        start_date=timezone.now(),
        end_date=timezone.now() + timezone.timedelta(days=365),
        status='active'
    )


@pytest.mark.django_db
class TestLibraryAPI:
    def test_list_categories(self, auth_client, test_category):
        url = reverse('category-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert len(res_json['data']) == 1
        assert res_json['data'][0]['name'] == "Devotional"

    def test_list_books(self, auth_client, free_book, premium_book):
        url = reverse('book-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        # Both books are published, so both should show up in list
        assert len(res_json['data']) == 2

    def test_retrieve_free_book(self, auth_client, free_book):
        url = reverse('book-detail', args=[free_book.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['data']['title'] == "Gita Mahatmya"

    def test_retrieve_premium_book_denied(self, auth_client, premium_book):
        # User has no active subscription, should return 403 Forbidden
        url = reverse('book-detail', args=[premium_book.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        res_json = response.json()
        assert res_json['success'] is False
        assert "Premium content requires" in res_json['message']

    def test_retrieve_premium_book_allowed_with_subscription(self, auth_client, premium_book, active_subscription):
        url = reverse('book-detail', args=[premium_book.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert res_json['data']['title'] == "Premium Upanishads"

    def test_list_premium_chapters_denied(self, auth_client, premium_book):
        url = reverse('book-chapters', args=[premium_book.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_premium_chapters_allowed(self, auth_client, premium_book, active_subscription, premium_chapter):
        url = reverse('book-chapters', args=[premium_book.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert len(res_json['data']) == 1
        assert res_json['data'][0]['title'] == "Premium Chapter One"

    def test_global_search_mantra(self, auth_client, premium_mantra):
        url = reverse('mantra-search')
        response = auth_client.get(url, {"search": "ઓમ"}) # Gujarati/Hindi character matching
        assert response.status_code == status.HTTP_200_OK
        res_json = response.json()
        assert len(res_json['data']) == 1
        assert res_json['data'][0]['title'] == "Shanti Mantra"
