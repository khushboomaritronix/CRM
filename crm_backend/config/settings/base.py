import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(DEBUG=(bool, False))
import os
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))
# environ.Env.read_env(BASE_DIR / ".env")

# SECURITY: Always require SECRET_KEY in production, never use default
SECRET_KEY = env("SECRET_KEY")  # Must be set in environment - no default!
# DEBUG defaults to False for safety, explicitly enable in development
DEBUG = env("DEBUG", default=False)
# ALLOWED_HOSTS is required, defaults to localhost only
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "import_export",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.core",
    "apps.users",
    "apps.roles",
    "apps.permissions",
    "apps.modules",
    "apps.role_user",
    "apps.role_module",
    "apps.role_permission",
    "apps.customers",
    "apps.vendors",
    "apps.rfq",
    "apps.estimates",
    "apps.invoices",
    "apps.proforma_invoices",
    "apps.purchase_orders",
    "apps.final_invoices",
    "apps.delivery_notes",
    "apps.company",
    "apps.pdf_templates",
    "apps.bulk_operations",
    "apps.custom_fields",
    "apps.credit_notes",
    "apps.debit_notes",
    "apps.payments",
    "apps.order_returns",
    "apps.currencies",
    "apps.inventory",
    "apps.reports",
    "apps.customer_pos",
    "apps.notifications",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": env("DB_NAME", default="crm_v3"),
#         "USER": env("DB_USER", default="postgres"),
#         "PASSWORD": env("DB_PASSWORD", default="1234"),
#         "HOST": env("DB_HOST", default="localhost"),
#         "PORT": env("DB_PORT", default="5432"),
#     }
# }
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "crm_uat",
        "USER": "crmuatadmin",
        "PASSWORD": "Secure@2026",
         "HOST":  "localhost",
        "PORT": "5432",
    }
}

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/django-static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── REST FRAMEWORK ───────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)
CORS_ALLOW_CREDENTIALS = True

# ─── EMAIL ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = env(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@crm.com")

# ─── EMAIL — Microsoft Graph (app-only auth) ──────────────────────────────────
# Outbound app email (account-created, password-changed, RFQ notifications) is
# sent via Microsoft Graph's POST /users/{mailbox}/sendMail — see
# apps.notifications.graph_email — not through EMAIL_BACKEND above, which
# Django's own mail_admins error-reporting still uses.
MS_TENANT_ID = env("MS_TENANT_ID", default="")
MS_CLIENT_ID = env("MS_CLIENT_ID", default="")
MS_CLIENT_SECRET = env("MS_CLIENT_SECRET", default="")

# ─── CELERY ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = env("TIME_ZONE", default="UTC")
# Emails are small, independent jobs — retry with backoff instead of losing
# them if a worker dies mid-task.
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_DEFAULT_RETRY_DELAY = 30
CELERY_TASK_MAX_RETRIES = 3
# Bounds how long a producer-side call (e.g. send_email_task.delay(...) in a
# request) can block if the broker (Redis) is unreachable, instead of
# Celery's default of unbounded retries — the callers already catch the
# resulting exception so a broker outage never fails the request itself.
CELERY_BROKER_CONNECTION_TIMEOUT = 2
CELERY_BROKER_CONNECTION_MAX_RETRIES = 1
# Nothing in this codebase calls .get()/.wait() on an email task's AsyncResult.
CELERY_TASK_IGNORE_RESULT = True

# ─── API DOCS ─────────────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "Sales & Purchase CRM API",
    "DESCRIPTION": "Dynamic Role-Based CRM for Sales and Purchase Management",
    "VERSION": "1.0.0",
}

# Frontend URL (used in emails)
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")
