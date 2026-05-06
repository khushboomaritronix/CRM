from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.roles.models import Role
from apps.role_user.models import RoleUser
from apps.modules.models import Module
from apps.role_module.models import RoleModule
from apps.permissions.models import Permission
from apps.role_permission.models import RolePermission

User = get_user_model()


class Command(BaseCommand):
    help = "Create first superadmin user with all permissions"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            default="superadmin",
            help="Admin username (default: superadmin)",
        )
        parser.add_argument(
            "--email",
            type=str,
            default="admin@example.com",
            help="Admin email (default: admin@example.com)",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="admin123",
            help="Admin password (default: admin123)",
        )
        parser.add_argument(
            "--first-name",
            type=str,
            default="Super",
            help="Admin first name (default: Super)",
        )
        parser.add_argument(
            "--last-name",
            type=str,
            default="Admin",
            help="Admin last name (default: Admin)",
        )

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]
        first_name = options["first_name"]
        last_name = options["last_name"]

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f"User with email '{email}' already exists!")
            )
            return

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f"User with username '{username}' already exists!")
            )
            return

        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        self.stdout.write(
            self.style.SUCCESS(f"✅ Superuser created successfully!")
        )
        self.stdout.write(f"   Username: {username}")
        self.stdout.write(f"   Email: {email}")
        self.stdout.write(f"   Password: {password}")
        self.stdout.write(f"   Name: {first_name} {last_name}")

        # Create or get SuperAdmin role
        super_admin_role, created = Role.objects.get_or_create(
            name="Super Admin",
            defaults={
                "description": "Full system access",
            },
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS("✅ Super Admin role created!")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS("✅ Super Admin role already exists!")
            )

        # Assign all modules and permissions to super admin role
        modules = Module.objects.all()
        permissions = Permission.objects.all()

        assigned_count = 0

        for module in modules:
            for permission in permissions:
                role_perm, created = RolePermission.objects.get_or_create(
                    role=super_admin_role,
                    module=module,
                    permission=permission,
                )
                if created:
                    assigned_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Assigned {assigned_count} permissions to Super Admin role!"
            )
        )

        # Assign role to user
        role_user, created = RoleUser.objects.get_or_create(
            user=user,
            role=super_admin_role,
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f"✅ Super Admin role assigned to user!")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"⚠️  User already has Super Admin role!")
            )

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(
            self.style.SUCCESS("🎉 SUPERADMIN SETUP COMPLETE!")
        )
        self.stdout.write("=" * 60)
        self.stdout.write("\n📝 You can now login with:")
        self.stdout.write(f"   Username: {username}")
        self.stdout.write(f"   Email: {email}")
        self.stdout.write(f"   Password: {password}")
        self.stdout.write("\n🌐 Access points:")
        self.stdout.write("   Admin Panel: http://localhost:8000/admin/")
        self.stdout.write("   API Docs: http://localhost:8000/api/docs/")
        self.stdout.write("   API Schema: http://localhost:8000/api/schema/")
        self.stdout.write("\n💡 Tip: Change password after first login!")
        self.stdout.write("=" * 60 + "\n")
