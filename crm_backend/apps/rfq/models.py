from decimal import Decimal
from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.vendors.models import Vendor
from apps.currencies.models import Currency


class RFQ(TimeStampedModel, CustomFieldValueMixin):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    rfq_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="rfqs")
    currency = models.ForeignKey(
    Currency,
    on_delete=models.PROTECT,
    related_name="rfqs",
    null=True,
    blank=True
)

    
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    subject = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "RFQ"

    def __str__(self):
        return self.rfq_number or f"RFQ-{self.id}"


    def recalculate(self):
        subtotal = Decimal(0)
        tax = Decimal(0)
        for item in self.items.all():
            item.amount = item.quantity * item.unit_price
            item.save()
            subtotal += item.amount
            tax += item.amount * (item.tax_percent / 100)
        self.subtotal = subtotal
        self.tax_amount = tax
        self.total = subtotal + tax
        self.save(update_fields=["subtotal", "tax_amount", "total"])


class RFQItem(models.Model):
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name="items")
    item_name = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=500, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=30, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
