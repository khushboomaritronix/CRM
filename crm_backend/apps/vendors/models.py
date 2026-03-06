from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin

class Vendor(TimeStampedModel, CustomFieldValueMixin):
    name = models.CharField(max_length=200)
    vendor_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True
    )
    website = models.URLField(blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    return_policy = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    gstin = models.CharField(max_length=20, blank=True)
    pan = models.CharField(max_length=20, blank=True)
    payment_terms = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    bank_ifsc = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    class Meta:
        ordering = ["-created_at"]
    def __str__(self):
        return self.name

