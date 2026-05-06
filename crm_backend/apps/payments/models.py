from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.customers.models import Customer
from apps.vendors.models import Vendor
from apps.invoices.models import FinalInvoice, ProformaInvoice

PAYMENT_TYPE = [
    ("received", "Payment Received"),
    ("made", "Payment Made"),
]
PAYMENT_METHOD = [
    ("cash", "Cash"),
    ("bank_transfer", "Bank Transfer"),
    ("cheque", "Cheque"),
    ("upi", "UPI"),
    ("neft", "NEFT"),
    ("rtgs", "RTGS"),
    ("imps", "IMPS"),
    ("card", "Credit/Debit Card"),
    ("other", "Other"),
]
PAYMENT_STATUS = [
    ("pending", "Pending"),
    ("completed", "Completed"),
    ("failed", "Failed"),
    ("cancelled", "Cancelled"),
]


class Payment(TimeStampedModel, CustomFieldValueMixin):
    payment_number = models.CharField(max_length=50, unique=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD, default="bank_transfer")
    payment_date = models.DateField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="completed")

    # Payer/Payee — only ONE of these will be set based on payment_type
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="payments"
    )
    vendor = models.ForeignKey(
        Vendor, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="payments"
    )
    proforma = models.ForeignKey(
        ProformaInvoice,
        null=True,
        blank=True,
        related_name="payments",
        on_delete=models.SET_NULL
    )
    
    currency = models.ForeignKey("currencies.Currency", on_delete=models.SET_NULL, null=True, blank=True) 
    finalinvoice = models.ForeignKey(
        FinalInvoice,
        null=True,
        blank=True,
        related_name="payments",
        on_delete=models.SET_NULL
    )  

    # Reference to invoice
    invoice_ref = models.CharField(max_length=100, blank=True, help_text="Invoice/PO number this payment is for")
    reference = models.CharField(max_length=200, blank=True, help_text="Bank ref, cheque no, UTR, etc.")
    bank_name = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-payment_date", "-created_at"]
        indexes = [
            models.Index(fields=["-payment_date"]),
            models.Index(fields=["payment_type"]),
        ]

    def __str__(self):
        return f"{self.payment_number} - {self.amount}"

    def clean(self):
        """Validate that exactly one of customer/vendor is set based on payment_type"""
        if self.payment_type == "received":
            # Payment received FROM customer
            if not self.customer:
                raise ValidationError({"customer": "Customer is required for received payments"})
            if self.vendor:
                raise ValidationError({"vendor": "Vendor should not be set for received payments"})
        elif self.payment_type == "made":
            # Payment made TO vendor
            if not self.vendor:
                raise ValidationError({"vendor": "Vendor is required for made payments"})
            if self.customer:
                raise ValidationError({"customer": "Customer should not be set for made payments"})

    def save(self, *args, **kwargs):
        """Run validation before saving"""
        self.full_clean()
        super().save(*args, **kwargs)
