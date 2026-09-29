from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.customers.models import Customer

ALLOWED_ATTACHMENT_EXTENSIONS = ["pdf", "xlsx", "xls", "csv", "doc", "docx"]
MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def validate_attachment_size(value):
    if value.size > MAX_ATTACHMENT_SIZE_BYTES:
        raise ValidationError("File size must not exceed 10 MB.")


class CustomerPO(TimeStampedModel, CustomFieldValueMixin):
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
    attachment = models.FileField(
        upload_to="customer_pos/",
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=ALLOWED_ATTACHMENT_EXTENSIONS),
            validate_attachment_size,
        ],
    )
    attachment_name = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Customer PO"

    def __str__(self):
        return f"{self.customer.name} — {self.po_number}"
