from decimal import Decimal
from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.customers.models import Customer
from apps.invoices.models import Invoice

CREDIT_STATUS = [
    ("draft", "Draft"),
    ("issued", "Issued"),
    ("applied", "Applied"),
    ("cancelled", "Cancelled"),
]


class CreditNote(TimeStampedModel, CustomFieldValueMixin):
    credit_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="credit_notes")
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="credit_notes")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=CREDIT_STATUS, default="draft")
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.credit_number

    def recalculate(self):
        subtotal = tax = Decimal(0)
        for item in self.items.all():
            item.amount = item.quantity * item.unit_price
            item.save()
            subtotal += item.amount
            tax += item.amount * (item.tax_percent / 100)
        self.subtotal = subtotal
        self.tax_amount = tax
        self.total = subtotal + tax
        self.save(update_fields=["subtotal", "tax_amount", "total"])



class CreditNoteItem(models.Model):
    item_name = models.CharField(max_length=200, blank=True) 
    credit_note = models.ForeignKey(CreditNote, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=500, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=30, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
