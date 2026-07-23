from django.urls import path
from apps.library.views import MantraAudioAPIView

urlpatterns = [
    path('<uuid:mantra_id>/', MantraAudioAPIView.as_view(), name='audio-detail'),
]
