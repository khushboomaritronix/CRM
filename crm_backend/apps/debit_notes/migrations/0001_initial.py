# Place this file at: apps/debit_notes/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('vendors', '__first__'),
        ('invoices', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='DebitNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('custom_field_values', models.JSONField(blank=True, default=dict)),
                ('debit_number', models.CharField(max_length=50, unique=True)),
                ('date', models.DateField()),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('issued', 'Issued'), ('applied', 'Applied'), ('cancelled', 'Cancelled')], default='draft', max_length=20)),
                ('reason', models.TextField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('currency', models.CharField(default='INR', max_length=3)),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='debit_notes', to='vendors.vendor')),
                ('purchase_order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='debit_notes', to='invoices.purchaseorder')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='DebitNoteItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=500)),
                ('quantity', models.DecimalField(decimal_places=3, max_digits=12)),
                ('unit', models.CharField(blank=True, max_length=30)),
                ('unit_price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('tax_percent', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('order', models.PositiveIntegerField(default=0)),
                ('debit_note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='debit_notes.debitnote')),
            ],
            options={'ordering': ['order']},
        ),
    ]
