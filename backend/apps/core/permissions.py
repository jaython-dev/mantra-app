from django.utils import timezone
from rest_framework import permissions


class HasActiveSubscriptionOrFreeContent(permissions.BasePermission):
    """
    Blocks access to premium content if the user does not have an active subscription.
    Free content is accessible by all users (including anonymous visitors).
    """
    message = "Premium content requires an active subscription."

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        from apps.library.models import Book, Chapter, Mantra, Audio
        from apps.billing.models import Subscription

        # Resolve book to check if premium
        book = None
        if isinstance(obj, Book):
            book = obj
        elif isinstance(obj, Chapter):
            book = obj.book
        elif isinstance(obj, Mantra):
            book = obj.chapter.book
        elif isinstance(obj, Audio):
            book = obj.mantra.chapter.book

        # If it's not premium content, grant access to everyone
        if book is None or not book.is_premium:
            return True

        # Premium content requires authentication
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin or staff can access everything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Check for active subscription
        return Subscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gte=timezone.now()
        ).exists()
