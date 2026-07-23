from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from apps.accounts.models import Profile
from apps.billing.models import SubscriptionPlan, Subscription

User = get_user_model()


@transaction.atomic
def register_user(username: str, email: str, password: str, bio: str = "", mobile_number: str = "", full_name: str = "") -> tuple[User, Token]:
    """
    Registers a new User, creates their Profile, and issues an API Auth Token.
    """
    # Create the user instance
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=full_name
    )
    # Create the user profile
    Profile.objects.create(user=user, bio=bio, mobile_number=mobile_number)
    
    # Auto-create a 4-day free trial subscription if a plan exists
    plan = SubscriptionPlan.objects.filter(is_active=True).first()
    if plan:
        now = timezone.now()
        Subscription.objects.create(
            user=user,
            plan=plan,
            start_date=now,
            end_date=now + timedelta(days=4),
            status='active',
            auto_renew=False
        )
    
    # Generate token
    token, _ = Token.objects.get_or_create(user=user)
    
    return user, token


def update_user_profile(user: User, **kwargs) -> Profile:
    """
    Updates the profile of a given user.
    """
    profile = getattr(user, 'profile', None)
    if not profile:
        profile = Profile.objects.create(user=user)
        
    avatar = kwargs.get('avatar')
    bio = kwargs.get('bio')
    mobile_number = kwargs.get('mobile_number')
    
    if avatar is not None:
        profile.avatar = avatar
    if bio is not None:
        profile.bio = bio
    if mobile_number is not None:
        profile.mobile_number = mobile_number
        
    profile.save()
    return profile


def change_user_password(user: User, password: str) -> None:
    """
    Safely changes a user's password.
    """
    user.set_password(password)
    user.save()
    
    # Regenerate token so other sessions are logged out (optional but highly secure)
    Token.objects.filter(user=user).delete()
    Token.objects.create(user=user)
