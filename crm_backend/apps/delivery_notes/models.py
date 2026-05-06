from decimal import Decimal
from django.db import models, transaction
from django.core.exceptions import ValidationError
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.customers.models import Customer
from apps.currencies.models import Currency


class DeliveryNote(TimeStampedModel, CustomFieldValueMixin):
    """
    Delivery Note - Track goods shipped to customers
    Links to Invoice/Sales Order
    """
    
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("confirmed", "Confirmed"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
        ("partially_received", "Partially Received"),
        ("cancelled", "Cancelled"),
    ]
    
    delivery_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="delivery_notes"
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name="delivery_notes",
        null=True,
        blank=True
    )
    
    # References
    invoice_reference = models.CharField(max_length=50, blank=True)
    po_reference = models.CharField(max_length=100, blank=True)
    sales_order_reference = models.CharField(max_length=50, blank=True)
    
    # Dates
    delivery_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    delivered_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )
    
    # Delivery details
    delivery_address = models.TextField(blank=True)
    delivery_city = models.CharField(max_length=100, blank=True)
    delivery_state = models.CharField(max_length=100, blank=True)
    delivery_country = models.CharField(max_length=100, blank=True)
    delivery_postal_code = models.CharField(max_length=20, blank=True)
    
    # Tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    carrier = models.CharField(max_length=100, blank=True)
    
    # Quantities
    total_items = models.PositiveIntegerField(default=0)
    delivered_items = models.PositiveIntegerField(default=0)
    
    # Notes
    notes = models.TextField(blank=True)
    special_instructions = models.TextField(blank=True)
    
    # Additional fields
    shipping_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0
    )
    insurance_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0
    )
    
    # PDF template
    pdf_template = models.ForeignKey(
        "pdf_templates.PDFTemplate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_notes"
    )
    
    custom_field_values = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Delivery Note"
        verbose_name_plural = "Delivery Notes"
        indexes = [
            models.Index(fields=["-delivery_date"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["customer", "-created_at"]),
        ]
    
    def __str__(self):
        return f"{self.delivery_number} - {self.customer.name}"
    
    def clean(self):
        """Validate delivery note"""
        if self.expected_delivery_date and self.delivery_date:
            if self.expected_delivery_date < self.delivery_date:
                raise ValidationError({
                    "expected_delivery_date": "Expected delivery date cannot be before delivery date"
                })
        
        if self.delivered_date and self.delivery_date:
            if self.delivered_date < self.delivery_date:
                raise ValidationError({
                    "delivered_date": "Delivered date cannot be before delivery date"
                })
        
        if self.status == "delivered":
            if not self.delivered_date:
                raise ValidationError({
                    "delivered_date": "Delivered date is required when marking as delivered"
                })
            if self.delivered_items <= 0:
                raise ValidationError({
                    "delivered_items": "Must have delivered items to mark as delivered"
                })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def calculate_totals(self):
        """Calculate total items from line items"""
        total = self.items.aggregate(
            total=models.Sum("quantity")
        )["total"] or 0
        self.total_items = total
        self.save(update_fields=["total_items"])
        return total
    
    @transaction.atomic
    def mark_delivered(self, delivered_date=None, delivered_items=None):
        """Mark delivery note as delivered"""
        from django.utils import timezone
        
        if not delivered_items:
            delivered_items = self.total_items
        
        if not delivered_date:
            delivered_date = timezone.now().date()
        
        if delivered_items < self.total_items:
            self.status = "partially_received"
        else:
            self.status = "delivered"
        
        self.delivered_date = delivered_date
        self.delivered_items = delivered_items
        self.save(update_fields=["status", "delivered_date", "delivered_items"])


class DeliveryNoteItem(models.Model):
    """Line items in a delivery note"""
    
    delivery_note = models.ForeignKey(
        DeliveryNote,
        on_delete=models.CASCADE,
        related_name="items"
    )
    
    # Item details
    item_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sku = models.CharField(max_length=100, blank=True)
    
    # Quantities
    quantity_ordered = models.DecimalField(max_digits=12, decimal_places=3)
    quantity_delivered = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unit = models.CharField(max_length=30, blank=True, default="pieces")
    
    # Pricing (optional, for reference)
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    total_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0
    )
    
    # Batch/Lot info
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ["order"]
        verbose_name = "Delivery Note Item"
        verbose_name_plural = "Delivery Note Items"
    
    def __str__(self):
        return f"{self.delivery_note.delivery_number} - {self.item_name}"
    
    def clean(self):
        """Validate delivery item"""
        if self.quantity_delivered > self.quantity_ordered:
            raise ValidationError({
                "quantity_delivered": "Delivered quantity cannot exceed ordered quantity"
            })
        
        if self.expiry_date:
            from django.utils import timezone
            if self.expiry_date < timezone.now().date():
                raise ValidationError({
                    "expiry_date": "Item has expired"
                })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        # Auto-calculate total price
        if not self.total_price or self.total_price == 0:
            self.total_price = self.quantity_ordered * self.unit_price
        super().save(*args, **kwargs)
