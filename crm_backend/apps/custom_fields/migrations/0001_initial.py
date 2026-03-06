from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = [('modules', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='CustomField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('label', models.CharField(max_length=100)),
                ('field_key', models.SlugField(max_length=100)),
                ('field_type', models.CharField(choices=[('text','Text'),('number','Number'),('date','Date'),('boolean','Boolean / Checkbox'),('select','Dropdown Select'),('textarea','Multi-line Text'),('email','Email'),('phone','Phone'),('url','URL')], default='text', max_length=20)),
                ('placeholder', models.CharField(blank=True, max_length=200)),
                ('default_value', models.CharField(blank=True, max_length=200)),
                ('options', models.JSONField(blank=True, default=list)),
                ('is_required', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='custom_fields', to='modules.module')),
            ],
            options={'ordering': ['order', 'label'], 'unique_together': {('module', 'field_key')}},
        ),
    ]
