from rest_framework import serializers
from .models import Raga

class RagaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Raga
        fields = ['id', 'name', 'time_of_day', 'mood']
