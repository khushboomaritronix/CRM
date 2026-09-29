from django.db import models


class EmailLog(models.Model):
    """One row per attempted outbound email, written by the Celery task that
    actually calls Microsoft Graph (see apps.notifications.tasks) — gives an
    audit trail of what was sent/failed instead of only server logs."""

    class Trigger(models.TextChoices):
        ACCOUNT_CREATED = "account_created", "Account created (with credentials)"
        PASSWORD_CHANGED = "password_changed", "Password changed confirmation"
        NEW_RFQ = "new_rfq", "New RFQ created (staff)"
        RFQ_STATUS_CHANGE = "rfq_status_change", "RFQ status changed (staff)"

    class Status(models.TextChoices):
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    trigger = models.CharField(max_length=30, choices=Trigger.choices, db_index=True)
    recipients = models.TextField(help_text="Comma-separated recipient addresses")
    subject = models.CharField(max_length=300)
    status = models.CharField(max_length=10, choices=Status.choices, db_index=True)
    error = models.TextField(blank=True)
    attempt = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Email log"
        verbose_name_plural = "Email logs"

    def __str__(self):
        return f"{self.get_trigger_display()} → {self.recipients} ({self.status})"


class NotificationRole(models.Model):
    """A Role whose members receive internal RFQ notification emails
    (new RFQ created, RFQ status changed). Superusers always receive them
    regardless — see apps.rfq.emails._rfq_staff_recipients()."""

    role = models.OneToOneField(
        "roles.Role", on_delete=models.CASCADE, related_name="notification_entry"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["role__name"]

    def __str__(self):
        return f"{self.role.name} receives RFQ emails"
