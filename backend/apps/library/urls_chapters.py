from django.urls import path
from apps.library.views import ChapterDetailAPIView, ChapterMantrasAPIView

urlpatterns = [
    path('<uuid:id>/', ChapterDetailAPIView.as_view(), name='chapter-detail'),
    path('<uuid:chapter_id>/mantras/', ChapterMantrasAPIView.as_view(), name='chapter-mantras'),
]
