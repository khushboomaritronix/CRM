
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Customer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("custom_field_values", models.JSONField(blank=True, default=dict)),
                ("name", models.CharField(max_length=200)),
                ("email", models.EmailField(blank=True)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("mobile", models.CharField(blank=True, max_length=20)),
                ("website", models.URLField(blank=True)),
                ("company_name", models.CharField(blank=True, max_length=200)),
                ("billing_address", models.TextField(blank=True)),
                ("billing_city", models.CharField(blank=True, max_length=100)),
                ("billing_state", models.CharField(blank=True, max_length=100)),
                ("billing_country", models.CharField(blank=True, max_length=100)),
                ("billing_pincode", models.CharField(blank=True, max_length=20)),
                ("shipping_address", models.TextField(blank=True)),
                ("shipping_city", models.CharField(blank=True, max_length=100)),
                ("shipping_state", models.CharField(blank=True, max_length=100)),
                ("shipping_country", models.CharField(blank=True, max_length=100)),
                ("shipping_pincode", models.CharField(blank=True, max_length=20)),
                ("gstin", models.CharField(blank=True, max_length=20)),
                ("pan", models.CharField(blank=True, max_length=20)),
                ("credit_limit", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("payment_terms", models.CharField(blank=True, max_length=100)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
