from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.core.utils import money
from apps.customers.models import Customer
from apps.invoices.models import Invoice

RETURN_STATUS = [
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("received", "Received"),
    ("rejected", "Rejected"),
    ("closed", "Closed"),
]
RETURN_TYPE = [
    ("sales_return", "Sales Return"),
    ("purchase_return", "Purchase Return"),
]


class OrderReturn(TimeStampedModel, CustomFieldValueMixin):
    return_number = models.CharField(max_length=50, unique=True)
    return_type = models.CharField(max_length=20, choices=RETURN_TYPE, default="sales_return")
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True, 
        related_name="order_returns"
    )
    vendor = models.ForeignKey(
        "vendors.Vendor", 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True, 
        related_name="order_returns"
    )
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="returns")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=RETURN_STATUS, default="pending")
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.ForeignKey(
        "currencies.Currency",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        default=None
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-date"]),
            models.Index(fields=["return_type"]),
        ]

    def __str__(self):
        return self.return_number

    def clean(self):
        """Validate that exactly one of customer/vendor is set based on return_type"""
        if self.return_type == "sales_return":
            # Return FROM customer
            if not self.customer:
                raise ValidationError({"customer": "Customer is required for sales returns"})
            if self.vendor:
                raise ValidationError({"vendor": "Vendor should not be set for sales returns"})
        elif self.return_type == "purchase_return":
            # Return FROM vendor
            if not self.vendor:
                raise ValidationError({"vendor": "Vendor is required for purchase returns"})
            if self.customer:
                raise ValidationError({"customer": "Customer should not be set for purchase returns"})

    def save(self, *args, **kwargs):
        """Run validation before saving"""
        self.full_clean()
        super().save(*args, **kwargs)

    def recalculate(self):
        subtotal = tax = Decimal(0)
        for item in self.items.all():
            item.amount = money(item.quantity * item.unit_price)
            item.save()
            subtotal += item.amount
            tax += money(item.amount * (item.tax_percent / 100))
        self.subtotal = subtotal
        self.tax_amount = tax
        self.total = subtotal + tax
        self.save(update_fields=["subtotal", "tax_amount", "total"])


class OrderReturnItem(models.Model):
    order_return = models.ForeignKey(OrderReturn, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=30, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
