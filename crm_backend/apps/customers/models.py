from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin


class CustomerGroup(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Customer(TimeStampedModel, CustomFieldValueMixin):
    # Basic Info
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    company_name = models.CharField(max_length=200, blank=True)

    # Address
    billing_address = models.TextField(blank=True)
    billing_city = models.CharField(max_length=100, blank=True)
    billing_state = models.CharField(max_length=100, blank=True)
    billing_country = models.CharField(max_length=100, blank=True)
    billing_pincode = models.CharField(max_length=20, blank=True)

    shipping_address = models.TextField(blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_country = models.CharField(max_length=100, blank=True)
    shipping_pincode = models.CharField(max_length=20, blank=True)

    # Tax / Business
    gstin = models.CharField(max_length=20, blank=True)
    pan = models.CharField(max_length=20, blank=True)
    vat_number = models.CharField(max_length=30, blank=True)
    group = models.ForeignKey(
        CustomerGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name="customers"
    )
    currency = models.ForeignKey(
        "currencies.Currency", on_delete=models.SET_NULL, null=True, blank=True, related_name="customers"
    )
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=100, blank=True)

    # Status
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
