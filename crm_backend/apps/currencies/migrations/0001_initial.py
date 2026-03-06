# Place this file at: apps/currencies/migrations/0001_initial.py
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('code', models.CharField(max_length=3, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('symbol', models.CharField(max_length=5)),
                ('exchange_rate', models.DecimalField(decimal_places=6, default=1, max_digits=12)),
                ('is_base', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'ordering': ['code'], 'verbose_name_plural': 'currencies'},
        ),
    ]
