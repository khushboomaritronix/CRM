from decimal import Decimal
from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.customers.models import Customer

DOCUMENT_STATUS = [
    ("draft", "Draft"),
    ("sent", "Sent"),
    ("paid", "Paid"),
    ("partial", "Partially Paid"),
    ("overdue", "Overdue"),
    ("cancelled", "Cancelled"),
    ("UNPAID", "UNPAID"),

]


class BaseDocument(TimeStampedModel, CustomFieldValueMixin):
    """Abstract base for all customer-facing documents."""
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT)
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=DOCUMENT_STATUS, default="draft")
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")
    # Customer PO reference (which customer PO triggered this document)
    po_reference = models.CharField(max_length=100, blank=True)
    # Adjustment amount (positive or negative manual adjustment)
    adjustment = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    pdf_template = models.ForeignKey(
        "pdf_templates.PDFTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        abstract = True

    def recalculate(self):
        subtotal = Decimal(0)
        tax = Decimal(0)
        for item in self.items.all():
            item.amount = item.quantity * item.unit_price
            item.save()
            subtotal += item.amount
            tax += item.amount * (item.tax_percent / 100)
        discount = subtotal * (self.discount_percent / 100) if self.discount_percent else self.discount_amount
        self.subtotal = subtotal
        self.tax_amount = tax
        self.discount_amount = discount
        self.total = subtotal + tax - discount + self.adjustment
        self.save(update_fields=["subtotal", "tax_amount", "discount_amount", "total"])


class BaseDocumentItem(models.Model):
    item_name = models.CharField(max_length=200, blank=True)  # Short item/product name
    description = models.CharField(max_length=500, blank=True, null=True)  # Longer description or details
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=30, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ["order"]


# ── Estimate ────────────────────────────────────────────────────
class Estimate(BaseDocument):
    estimate_number = models.CharField(max_length=50, unique=True)
    valid_until = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.estimate_number


class EstimateItem(BaseDocumentItem):
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name="items")


# ── Invoice ─────────────────────────────────────────────────────
class Invoice(BaseDocument):
    invoice_number = models.CharField(max_length=50, unique=True)
    estimate = models.ForeignKey(
        Estimate, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.invoice_number


class InvoiceItem(BaseDocumentItem):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")


# ── Proforma Invoice ────────────────────────────────────────────
class ProformaInvoice(BaseDocument):
    proforma_number = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.proforma_number


class ProformaInvoiceItem(BaseDocumentItem):
    proforma = models.ForeignKey(ProformaInvoice, on_delete=models.CASCADE, related_name="items")


# ── Purchase Order ──────────────────────────────────────────────
class PurchaseOrder(TimeStampedModel, CustomFieldValueMixin):
    PO_STATUS = [
        ("draft", "Draft"),
        ("approved", "Approved"),
        ("sent", "Sent to Vendor"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]
    po_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.PROTECT, related_name="purchase_orders")
    date = models.DateField()
    expected_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PO_STATUS, default="draft")
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")
    # Customer PO reference (which customer PO triggered this document)
    po_reference = models.CharField(max_length=100, blank=True)
    # Adjustment amount (positive or negative manual adjustment)
    adjustment = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    pdf_template = models.ForeignKey(
        "pdf_templates.PDFTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )
    custom_field_values = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.po_number

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


class PurchaseOrderItem(BaseDocumentItem):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")


# ── Final Invoice ────────────────────────────────────────────────
class FinalInvoice(BaseDocument):
    final_number = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(
        Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="final_invoices"
    )
    proforma = models.ForeignKey(
        ProformaInvoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="final_invoices"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.final_number


class FinalInvoiceItem(BaseDocumentItem):
    final_invoice = models.ForeignKey(FinalInvoice, on_delete=models.CASCADE, related_name="items")
