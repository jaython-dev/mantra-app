from django.urls import path
from apps.library.views import MantraDetailAPIView, MantraAudioAPIView, MantraSearchAPIView

urlpatterns = [
    path('search/', MantraSearchAPIView.as_view(), name='mantra-search'),
    path('<uuid:id>/', MantraDetailAPIView.as_view(), name='mantra-detail'),
    path('<uuid:mantra_id>/audio/', MantraAudioAPIView.as_view(), name='mantra-audio'),
]
