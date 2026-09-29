from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin


class Currency(TimeStampedModel, CustomFieldValueMixin):
    code = models.CharField(max_length=3, unique=True)  # INR, USD, EUR
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=5)
    exchange_rate = models.DecimalField(max_digits=12, decimal_places=6, default=1)
    is_base = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]
        verbose_name_plural = "currencies"

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        if self.is_base:
            Currency.objects.filter(is_base=True).exclude(pk=self.pk).update(is_base=False)
        super().save(*args, **kwargs)
