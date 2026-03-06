from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("customers", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="CustomerPO",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("po_number", models.CharField(max_length=100)),
                ("our_reference", models.CharField(blank=True, max_length=100)),
                ("date", models.DateField()),
                ("due_date", models.DateField(blank=True, null=True)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("currency", models.CharField(default="INR", max_length=3)),
                ("status", models.CharField(choices=[("received","Received"),("processing","Processing"),("fulfilled","Fulfilled"),("cancelled","Cancelled")], default="received", max_length=20)),
                ("description", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("attachment", models.FileField(blank=True, null=True, upload_to="customer_pos/")),
                ("attachment_name", models.CharField(blank=True, max_length=255)),
                ("customer", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="customer_pos", to="customers.customer")),
            ],
            options={"ordering": ["-created_at"], "verbose_name": "Customer PO"},
        ),
    ]
