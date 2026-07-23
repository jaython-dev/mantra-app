from django.urls import path
from apps.accounts.views import (
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    ChangePasswordAPIView,
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
]
