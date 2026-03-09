from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.models import CustomFieldValueMixin


class CompanyProfile(TimeStampedModel, CustomFieldValueMixin):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    gstin = models.CharField(max_length=20, blank=True)
    pan = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to="company/", blank=True, null=True)
    signature = models.ImageField(upload_to="signatures/", blank=True, null=True)
    signature_name = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    bank_ifsc = models.CharField(max_length=20, blank=True)
    currency = models.CharField(max_length=3, default="INR")
    invoice_prefix = models.CharField(max_length=10, default="INV")
    invoice_counter = models.PositiveIntegerField(default=1)
    invoice_due_after_days = models.PositiveIntegerField(default=12)
    # financial_year_start = models.DateField(null=True, blank=True)
    terms = models.TextField(blank=True)
    footer_text = models.TextField(blank=True)

    class Meta:
        verbose_name = "Company Profile"

    def __str__(self):
        return self.name

    @classmethod
    def get_instance(cls):
        obj, _ = cls.objects.get_or_create(id=1, defaults={"name": "My Company"})
        return obj
