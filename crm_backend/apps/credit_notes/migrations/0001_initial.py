# Place this file at: apps/credit_notes/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customers', '__first__'),
        ('invoices', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='CreditNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('custom_field_values', models.JSONField(blank=True, default=dict)),
                ('credit_number', models.CharField(max_length=50, unique=True)),
                ('date', models.DateField()),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('issued', 'Issued'), ('applied', 'Applied'), ('cancelled', 'Cancelled')], default='draft', max_length=20)),
                ('reason', models.TextField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('currency', models.CharField(default='INR', max_length=3)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='credit_notes', to='customers.customer')),
                ('invoice', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='credit_notes', to='invoices.invoice')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='CreditNoteItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=500)),
                ('quantity', models.DecimalField(decimal_places=3, max_digits=12)),
                ('unit', models.CharField(blank=True, max_length=30)),
                ('unit_price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('tax_percent', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('order', models.PositiveIntegerField(default=0)),
                ('credit_note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='credit_notes.creditnote')),
            ],
            options={'ordering': ['order']},
        ),
    ]
