from decimal import Decimal
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.core.utils import money
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
            item.amount = money(item.quantity * item.unit_price)
            item.save()
            subtotal += item.amount
            tax += money(item.amount * (item.tax_percent / 100))
        self.subtotal = subtotal
        self.tax_amount = tax
        self.total = subtotal + tax
        self.save(update_fields=["subtotal", "tax_amount", "total"])

    def clean(self):
        """Validate RFQ state"""
        if self.due_date and self.date:
            if self.due_date < self.date:
                raise ValidationError({"due_date": "Due date must be after RFQ date"})


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

    def __str__(self):
        return f"{self.rfq.rfq_number} - {self.item_name}"


class RFQResponse(TimeStampedModel):
    """Tracks vendor responses to RFQs with quoted prices"""
    
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("responded", "Responded"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("expired", "Expired"),
    ]
    
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name="responses")
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="rfq_responses")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    # Response details
    response_date = models.DateField(null=True, blank=True)
    response_deadline = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Quoted totals
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    
    # Acceptance tracking
    accepted_at = models.DateTimeField(null=True, blank=True)
    converted_to_po_number = models.CharField(max_length=50, null=True, blank=True, unique=True)
    
    class Meta:
        ordering = ["-created_at"]
        unique_together = ("rfq", "vendor")
    
    def __str__(self):
        return f"Response to {self.rfq.rfq_number} from {self.vendor.name}"
    
    def clean(self):
        """Validate response state"""
        if self.response_deadline and self.response_date:
            if self.response_date > self.response_deadline:
                raise ValidationError(
                    {"response_date": "Response date cannot be after deadline"}
                )
        
        if self.status == "expired":
            if not self.response_deadline:
                raise ValidationError(
                    {"response_deadline": "Response deadline required to mark as expired"}
                )
            if self.response_deadline >= timezone.now().date():
                raise ValidationError(
                    {"status": "Can only mark as expired if deadline has passed"}
                )
    
    def is_deadline_passed(self):
        """Check if response deadline has passed"""
        if not self.response_deadline:
            return False
        return timezone.now().date() > self.response_deadline
    
    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Auto-expire if deadline passed
        if self.is_deadline_passed() and self.status == "pending":
            self.status = "expired"
        
        super().save(*args, **kwargs)


class RFQResponseItem(models.Model):
    """Line items for RFQ vendor responses"""
    
    response = models.ForeignKey(RFQResponse, on_delete=models.CASCADE, related_name="items")
    rfq_item = models.ForeignKey(RFQItem, on_delete=models.PROTECT)
    
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ["order"]
    
    def __str__(self):
        return f"{self.response.rfq.rfq_number} - Item {self.order}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate amount
        self.amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
