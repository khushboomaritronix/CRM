from django.db import models
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
    # currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="completed")

    # Payer/Payee — only one of these will be set
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
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

    def __str__(self):
        return f"{self.payment_number} - {self.amount}"
