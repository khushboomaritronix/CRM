from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin

class Role(TimeStampedModel, CustomFieldValueMixin):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ["name"]
    def __str__(self):
        return self.name
