
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("vendors", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="RFQ",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("custom_field_values", models.JSONField(blank=True, default=dict)),
                ("rfq_number", models.CharField(max_length=50, unique=True)),
                ("date", models.DateField()),
                ("due_date", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("draft","Draft"),("sent","Sent"),("received","Received"),("cancelled","Cancelled")], default="draft", max_length=20)),
                ("subject", models.CharField(blank=True, max_length=200)),
                ("notes", models.TextField(blank=True)),
                ("terms", models.TextField(blank=True)),
                ("subtotal", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("tax_amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("total", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="rfqs", to="vendors.vendor")),
            ],
            options={"ordering": ["-created_at"], "verbose_name": "RFQ"},
        ),
        migrations.CreateModel(
            name="RFQItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("description", models.CharField(max_length=500)),
                ("quantity", models.DecimalField(decimal_places=3, max_digits=12)),
                ("unit", models.CharField(blank=True, max_length=30)),
                ("unit_price", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("tax_percent", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("order", models.PositiveIntegerField(default=0)),
                ("rfq", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="rfq.rfq")),
            ],
            options={"ordering": ["order"]},
        ),
    ]
