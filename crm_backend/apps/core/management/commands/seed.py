"""
Management command to seed initial data:
- Default permissions (CRUD)
- Default modules (including new ones)
- Default currencies
- Superuser creation
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

PERMISSIONS = [
    {"name": "View",     "codename": "can_view",   "description": "Can view records"},
    {"name": "Create",   "codename": "can_create",  "description": "Can create records"},
    {"name": "Update",   "codename": "can_update",  "description": "Can update records"},
    {"name": "Delete",   "codename": "can_delete",  "description": "Can delete records"},
    {"name": "Export",   "codename": "can_export",  "description": "Can export data"},
    {"name": "Import",   "codename": "can_import",  "description": "Can import data"},
    {"name": "Print/PDF","codename": "can_print",   "description": "Can generate PDFs"},
]

MODULES = [
    {"name": "Dashboard",          "slug": "dashboard",          "icon": "LayoutDashboard", "order": 1},
    {"name": "Customers",          "slug": "customers",          "icon": "Users",           "order": 2},
    {"name": "Vendors",            "slug": "vendors",            "icon": "Building2",       "order": 3},
    {"name": "RFQ",                "slug": "rfq",                "icon": "FileSearch",      "order": 4},
    {"name": "Estimates",          "slug": "estimates",          "icon": "FileText",        "order": 5},
    {"name": "Invoices",           "slug": "invoices",           "icon": "Receipt",         "order": 6},
    {"name": "Proforma Invoices",  "slug": "proforma_invoices",  "icon": "FileOutput",      "order": 7},
    {"name": "Purchase Orders",    "slug": "purchase_orders",    "icon": "ShoppingCart",    "order": 8},
    {"name": "Final Invoices",     "slug": "final_invoices",     "icon": "CheckSquare",     "order": 9},
    {"name": "Credit Notes",       "slug": "credit_notes",       "icon": "FileMinus",       "order": 10},
    {"name": "Debit Notes",        "slug": "debit_notes",        "icon": "FilePlus",        "order": 11},
    {"name": "Payments",           "slug": "payments",           "icon": "CreditCard",      "order": 12},
    {"name": "Order Returns",      "slug": "order_returns",      "icon": "RotateCcw",       "order": 13},
    {"name": "Currencies",         "slug": "currencies",         "icon": "DollarSign",      "order": 14},
    {"name": "Customer POs",       "slug": "customer_pos",       "icon": "Inbox",           "order": 10},
    {"name": "Reports",            "slug": "reports",            "icon": "BarChart2",       "order": 15},
    {"name": "Company",            "slug": "company",            "icon": "Settings",        "order": 16},
    {"name": "PDF Templates",      "slug": "pdf_templates",      "icon": "FileType",        "order": 17},
    {"name": "Users",              "slug": "users",              "icon": "UserCog",         "order": 18},
    {"name": "Roles",              "slug": "roles",              "icon": "Shield",          "order": 19},
    {"name": "Custom Fields",      "slug": "custom_fields",      "icon": "Sliders",         "order": 20},
    {"name": "Bulk Operations",    "slug": "bulk_operations",    "icon": "Database",        "order": 21},
    {"name": "Inventory",          "slug": "inventory",          "icon": "Package",         "order": 22},
]

CURRENCIES = [
    {"code": "INR", "name": "Indian Rupee",      "symbol": "₹",    "exchange_rate": 1.0,      "is_base": True},
    {"code": "USD", "name": "US Dollar",          "symbol": "$",    "exchange_rate": 0.012},
    {"code": "EUR", "name": "Euro",               "symbol": "€",    "exchange_rate": 0.011},
    {"code": "GBP", "name": "British Pound",      "symbol": "£",    "exchange_rate": 0.0095},
    {"code": "AED", "name": "UAE Dirham",          "symbol": "د.إ", "exchange_rate": 0.044},
    {"code": "SGD", "name": "Singapore Dollar",   "symbol": "S$",   "exchange_rate": 0.016},
    {"code": "JPY", "name": "Japanese Yen",        "symbol": "¥",    "exchange_rate": 1.8},
]


class Command(BaseCommand):
    help = "Seed initial CRM data (permissions, modules, currencies, superuser)"

    def add_arguments(self, parser):
        parser.add_argument("--email",    default="admin@crm.com")
        parser.add_argument("--password", default="Admin@123")

    def handle(self, *args, **options):
        from apps.permissions.models import Permission
        from apps.modules.models import Module
        from apps.roles.models import Role
        from apps.role_user.models import RoleUser
        from apps.role_permission.models import RolePermission
        from apps.role_module.models import RoleModule
        from apps.currencies.models import Currency

        self.stdout.write("\n── Permissions ──────────────────────────────")
        for p in PERMISSIONS:
            _, created = Permission.objects.get_or_create(codename=p["codename"], defaults=p)
            self.stdout.write(f"  {'✓ Created' if created else '· Exists '} {p['codename']}")

        self.stdout.write("\n── Modules ──────────────────────────────────")
        for m in MODULES:
            _, created = Module.objects.get_or_create(slug=m["slug"], defaults=m)
            self.stdout.write(f"  {'✓ Created' if created else '· Exists '} {m['slug']}")

        self.stdout.write("\n── Currencies ───────────────────────────────")
        for c in CURRENCIES:
            _, created = Currency.objects.update_or_create(code=c["code"], defaults=c)
            self.stdout.write(f"  {'✓ Created' if created else '· Updated'} {c['code']}")

        self.stdout.write("\n── Admin Role ───────────────────────────────")
        admin_role, _ = Role.objects.get_or_create(
            name="Administrator",
            defaults={"description": "Full system access", "is_active": True},
        )
        for module in Module.objects.all():
            RoleModule.objects.get_or_create(role=admin_role, module=module)
            for perm in Permission.objects.all():
                RolePermission.objects.get_or_create(role=admin_role, module=module, permission=perm)
        self.stdout.write("  ✓ Administrator role has full access to all modules")

        self.stdout.write("\n── Superuser ────────────────────────────────")
        email = options["email"]
        password = options["password"]
        if not User.objects.filter(email=email).exists():
            user = User.objects.create_superuser(
                email=email, username="admin", password=password,
                first_name="System", last_name="Admin",
            )
            RoleUser.objects.get_or_create(role=admin_role, user=user)
            self.stdout.write(self.style.SUCCESS(f"  ✓ Superuser created: {email} / {password}"))
        else:
            self.stdout.write(f"  · Superuser {email} already exists")

        self.stdout.write(self.style.SUCCESS("\n✅ Seed complete!\n"))
