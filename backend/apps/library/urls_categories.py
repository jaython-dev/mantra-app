from django.urls import path
from apps.library.views import CategoryListAPIView

urlpatterns = [
    path('', CategoryListAPIView.as_view(), name='category-list'),
]
