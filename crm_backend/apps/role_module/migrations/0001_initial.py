
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("roles", "0001_initial"),
        ("modules", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="RoleModule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("role", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="role_modules", to="roles.role")),
                ("module", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="module_roles", to="modules.module")),
            ],
            options={"unique_together": {("role", "module")}},
        ),
    ]
