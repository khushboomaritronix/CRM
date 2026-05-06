from django.core.management.base import BaseCommand
from apps.modules.models import Module


class Command(BaseCommand):
    help = "Add missing modules to the database"

    def handle(self, *args, **options):
        """
        Create all necessary modules if they don't exist
        """
        modules_data = [
            {
                "name": "Delivery Notes",
                "slug": "delivery_notes",
                "description": "Manage delivery notes and shipments",
                "order": 9,
            },
            {
                "name": "Customer POS",
                "slug": "customer_pos",
                "description": "Manage customer points of sale",
                "order": 10,
            },
        ]

        created_count = 0

        for module_info in modules_data:
            module, created = Module.objects.get_or_create(
                slug=module_info["slug"],
                defaults={
                    "name": module_info["name"],
                    "description": module_info["description"],
                    "order": module_info["order"],
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Created module: {module.name}"
                    )
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️  Module already exists: {module.name}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Total modules created: {created_count}"
            )
        )

        # List all modules
        all_modules = Module.objects.all().order_by("order", "name")
        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Total modules in system: {all_modules.count()}")
        )
        for module in all_modules:
            self.stdout.write(f"   - {module.name} ({module.slug})")
