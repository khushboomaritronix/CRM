from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("invoices", "0001_initial")]
    operations = [
        # po_reference on all document types
        migrations.AddField(model_name="estimate", name="po_reference",
            field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="invoice", name="po_reference",
            field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="proformainvoice", name="po_reference",
            field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="finalinvoice", name="po_reference",
            field=models.CharField(blank=True, max_length=100)),
        # adjustment
        migrations.AddField(model_name="estimate", name="adjustment",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
        migrations.AddField(model_name="invoice", name="adjustment",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
        migrations.AddField(model_name="proformainvoice", name="adjustment",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
        migrations.AddField(model_name="purchaseorder", name="adjustment",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
        migrations.AddField(model_name="finalinvoice", name="adjustment",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14)),
        # item_name on all item types
        migrations.AddField(model_name="estimateitem", name="item_name",
            field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="invoiceitem", name="item_name",
            field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="proformainvoiceitem", name="item_name",
            field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="purchaseorderitem", name="item_name",
            field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="finalinvoiceitem", name="item_name",
            field=models.CharField(blank=True, max_length=200)),
    ]
