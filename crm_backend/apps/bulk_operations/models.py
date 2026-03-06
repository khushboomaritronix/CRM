from django.db import models


# Bulk operations don't need a model, but we track import history
from apps.core.models import TimeStampedModel
from django.conf import settings


class ImportHistory(TimeStampedModel):
    STATUS_CHOICES = [("pending", "Pending"), ("success", "Success"), ("failed", "Failed")]
    module = models.CharField(max_length=50)
    file_name = models.CharField(max_length=200)
    total_rows = models.PositiveIntegerField(default=0)
    imported_rows = models.PositiveIntegerField(default=0)
    failed_rows = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    error_log = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.module} import - {self.created_at}"
