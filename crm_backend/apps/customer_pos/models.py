from django.db import models
from apps.core.models import TimeStampedModel
from apps.customers.models import Customer


class CustomerPO(TimeStampedModel):
    STATUS_CHOICES = [
        ("received", "Received"),
        ("processing", "Processing"),
        ("fulfilled", "Fulfilled"),
        ("cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="customer_pos")
    po_number = models.CharField(max_length=100)  # Customer's own PO number
    our_reference = models.CharField(max_length=100, blank=True)  # Our internal ref
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    # File attachments
    attachment = models.FileField(upload_to="customer_pos/", null=True, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Customer PO"

    def __str__(self):
        return f"{self.customer.name} — {self.po_number}"
