from django.db import models

class Raga(models.Model):
    name = models.CharField(max_length=100)
    time_of_day = models.CharField(max_length=50)  # morning, afternoon, evening, night
    mood = models.CharField(max_length=50)         # peaceful, energetic, etc.

    def __str__(self):
        return f"{self.name} - {self.time_of_day} ({self.mood})"

    class Meta:
        ordering = ['name']