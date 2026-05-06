from django.core.management.base import BaseCommand
from apps.modules.models import Module
from apps.permissions.models import Permission
from apps.role_permission.models import RolePermission
from apps.roles.models import Role


class Command(BaseCommand):
    help = "Setup permissions for modules module and assign to admin roles"

    def handle(self, *args, **options):
        # Get or create modules module
        modules_module, created = Module.objects.get_or_create(
            slug="modules",
            defaults={
                "name": "Modules",
                "icon": "Layers",
                "description": "Module Management",
                "is_active": True,
                "order": 999,
            },
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f"✓ Created modules module"))
        else:
            self.stdout.write(self.style.WARNING(f"✓ Modules module already exists"))

        # Create permissions for modules module
        perm_codes = ["can_view", "can_create", "can_update", "can_delete"]
        perms = []
        
        for code in perm_codes:
            perm, perm_created = Permission.objects.get_or_create(
                module=modules_module,
                codename=code,
                defaults={
                    "name": f"Can {code.replace('can_', '').title()}",
                },
            )
            perms.append(perm)
            if perm_created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created permission: {code}"))

        # Get Super Admin role (usually id=1 or name="Super Admin")
        super_admin_role = Role.objects.filter(
            name__icontains="super"
        ).first() or Role.objects.filter(id=1).first()

        if super_admin_role:
            # Assign all permissions to Super Admin
            for perm in perms:
                rp, created = RolePermission.objects.get_or_create(
                    role=super_admin_role,
                    permission=perm,
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  ✓ Assigned {perm.codename} to {super_admin_role.name}"
                        )
                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ Modules permissions setup complete!"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "⚠️  No Super Admin role found. Please assign permissions manually."
                )
            )
