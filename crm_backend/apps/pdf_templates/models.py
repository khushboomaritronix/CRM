from django.db import models
from apps.core.models import TimeStampedModel, CustomFieldValueMixin
from apps.modules.models import Module


class PDFTemplate(TimeStampedModel, CustomFieldValueMixin):
    MODULE_TYPES = [
        ("invoice", "Invoice"),
        ("estimate", "Estimate"),
        ("proforma", "Proforma Invoice"),
        ("purchase_order", "Purchase Order"),
        ("final_invoice", "Final Invoice"),
        ("rfq", "RFQ"),
    ]

    name = models.CharField(max_length=100)
    module_type = models.CharField(max_length=30, choices=MODULE_TYPES)
    description = models.TextField(blank=True)
    html_body = models.TextField(
        help_text="Jinja2 HTML template. Context vars: obj, company, items"
    )
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-is_default", "name"]

    def __str__(self):
        return f"{self.name} ({self.module_type})"

    def save(self, *args, **kwargs):
        if self.is_default:
            PDFTemplate.objects.filter(
                module_type=self.module_type, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
