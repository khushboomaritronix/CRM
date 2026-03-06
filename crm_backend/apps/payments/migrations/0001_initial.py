# Place this file at: apps/payments/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customers', '__first__'),
        ('vendors', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('payment_number', models.CharField(max_length=50, unique=True)),
                ('payment_type', models.CharField(choices=[('received', 'Payment Received'), ('made', 'Payment Made')], max_length=20)),
                ('payment_method', models.CharField(choices=[('cash', 'Cash'), ('bank_transfer', 'Bank Transfer'), ('cheque', 'Cheque'), ('upi', 'UPI'), ('neft', 'NEFT'), ('rtgs', 'RTGS'), ('imps', 'IMPS'), ('card', 'Credit/Debit Card'), ('other', 'Other')], default='bank_transfer', max_length=30)),
                ('payment_date', models.DateField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=14)),
                ('currency', models.CharField(default='INR', max_length=3)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='completed', max_length=20)),
                ('invoice_ref', models.CharField(blank=True, help_text='Invoice/PO number this payment is for', max_length=100)),
                ('reference', models.CharField(blank=True, help_text='Bank ref, cheque no, UTR, etc.', max_length=200)),
                ('bank_name', models.CharField(blank=True, max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='customers.customer')),
                ('vendor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='vendors.vendor')),
            ],
            options={'ordering': ['-payment_date', '-created_at']},
        ),
    ]
