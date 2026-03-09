from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin

class Permission(TimeStampedModel, CustomFieldValueMixin):
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    class Meta:
        ordering = ["name"]
    def __str__(self):
        return f"{self.name} ({self.codename})"
