
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Vendor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("custom_field_values", models.JSONField(blank=True, default=dict)),
                ("name", models.CharField(max_length=200)),
                ("email", models.EmailField(blank=True)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("company_name", models.CharField(blank=True, max_length=200)),
                ("address", models.TextField(blank=True)),
                ("city", models.CharField(blank=True, max_length=100)),
                ("state", models.CharField(blank=True, max_length=100)),
                ("country", models.CharField(blank=True, max_length=100)),
                ("pincode", models.CharField(blank=True, max_length=20)),
                ("gstin", models.CharField(blank=True, max_length=20)),
                ("pan", models.CharField(blank=True, max_length=20)),
                ("payment_terms", models.CharField(blank=True, max_length=100)),
                ("bank_name", models.CharField(blank=True, max_length=100)),
                ("bank_account", models.CharField(blank=True, max_length=50)),
                ("bank_ifsc", models.CharField(blank=True, max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
