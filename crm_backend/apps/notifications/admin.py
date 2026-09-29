from django.contrib import admin
from .models import EmailLog, NotificationRole


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ("trigger", "recipients", "subject", "status", "attempt", "created_at")
    list_filter = ("trigger", "status")
    search_fields = ("recipients", "subject")
    readonly_fields = (
        "trigger", "recipients", "subject", "status", "error", "attempt", "created_at"
    )

    def has_add_permission(self, request):
        return False


@admin.register(NotificationRole)
class NotificationRoleAdmin(admin.ModelAdmin):
    list_display = ("role", "created_at")
