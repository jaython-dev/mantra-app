from django.urls import path
from apps.library.views import BookListAPIView, BookDetailAPIView, BookChaptersAPIView

urlpatterns = [
    path('', BookListAPIView.as_view(), name='book-list'),
    path('<uuid:id>/', BookDetailAPIView.as_view(), name='book-detail'),
    path('<uuid:book_id>/chapters/', BookChaptersAPIView.as_view(), name='book-chapters'),
]
