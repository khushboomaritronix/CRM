from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin


class ItemGroup(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Item(TimeStampedModel, CustomFieldValueMixin):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=500, blank=True)
    long_description = models.TextField(blank=True)
    unit = models.CharField(max_length=30, blank=True)
    item_group = models.ForeignKey(
        ItemGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name="items"
    )
    tax1_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax2_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ItemRate(TimeStampedModel):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="rates")
    currency = models.ForeignKey("currencies.Currency", on_delete=models.CASCADE, related_name="item_rates")
    rate = models.DecimalField(max_digits=14, decimal_places=4)

    class Meta:
        unique_together = ("item", "currency")

    def __str__(self):
        return f"{self.item.name} @ {self.currency.code}: {self.rate}"
