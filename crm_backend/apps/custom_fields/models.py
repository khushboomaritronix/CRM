from django.db import models
from apps.core.models import TimeStampedModel
from apps.modules.models import Module


class CustomField(TimeStampedModel):
    FIELD_TYPES = [
        ("text", "Text"),
        ("number", "Number"),
        ("date", "Date"),
        ("boolean", "Boolean / Checkbox"),
        ("select", "Dropdown Select"),
        ("textarea", "Multi-line Text"),
        ("email", "Email"),
        ("phone", "Phone"),
        ("url", "URL"),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="custom_fields")
    label = models.CharField(max_length=100)
    field_key = models.SlugField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default="text")
    placeholder = models.CharField(max_length=200, blank=True)
    default_value = models.CharField(max_length=200, blank=True)
    options = models.JSONField(
        default=list, blank=True, help_text="For select type: [{label, value}, ...]"
    )
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "label"]
        unique_together = ("module", "field_key")

    def __str__(self):
        return f"{self.module.name} → {self.label}"
