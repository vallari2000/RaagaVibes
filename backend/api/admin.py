from django.contrib import admin
from .models import Raga

@admin.register(Raga)
class RagaAdmin(admin.ModelAdmin):
    list_display = ('name', 'time_of_day', 'mood')
    list_filter = ('time_of_day', 'mood')
    search_fields = ('name',)