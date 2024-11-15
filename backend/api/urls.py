from django.urls import path
from .views import RagaList, SpotifyTokenView

urlpatterns = [
    path('ragas/', RagaList.as_view(), name='raga-list'),
    path('spotify-token/', SpotifyTokenView.as_view(), name='spotify-token'),
]