from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base with created_at / updated_at."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CustomFieldValueMixin(models.Model):
    """Mixin to add JSONB custom field storage to any model."""
    custom_field_values = models.JSONField(default=dict, blank=True)

    class Meta:
        abstract = True
