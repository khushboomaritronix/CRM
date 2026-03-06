
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("modules", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="PDFTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("module_type", models.CharField(choices=[("invoice","Invoice"),("estimate","Estimate"),("proforma","Proforma Invoice"),("purchase_order","Purchase Order"),("final_invoice","Final Invoice"),("rfq","RFQ")], max_length=30)),
                ("description", models.TextField(blank=True)),
                ("html_body", models.TextField()),
                ("is_default", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["-is_default", "name"]},
        ),
    ]
