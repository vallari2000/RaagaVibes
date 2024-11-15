from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Raga
from .serializers import RagaSerializer
import requests
import base64
import json

class RagaList(generics.ListAPIView):
    serializer_class = RagaSerializer

    def get_queryset(self):
        time_of_day = self.request.query_params.get('time_of_day')
        mood = self.request.query_params.get('mood')
        queryset = Raga.objects.all()
        if time_of_day:
            queryset = queryset.filter(time_of_day=time_of_day)
        if mood:
            queryset = queryset.filter(mood=mood)
        return queryset

class SpotifyTokenView(APIView):
    def get(self, request):
        # Get Spotify access token using client credentials flow
        auth_header = base64.b64encode(
            f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
        ).decode()
        
        response = requests.post(
            'https://accounts.spotify.com/api/token',
            headers={
                'Authorization': f'Basic {auth_header}'
            },
            data={
                'grant_type': 'client_credentials'
            }
        )
        
        if response.status_code == 200:
            return Response({'token': response.json()['access_token']})
        return Response({'error': 'Failed to get Spotify token'}, status=400)