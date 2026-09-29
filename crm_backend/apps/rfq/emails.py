import logging

from django.conf import settings
from django.template.loader import render_to_string

from apps.notifications.models import EmailLog
from apps.notifications.tasks import send_email_task

logger = logging.getLogger(__name__)


def _dispatch_email(*args, **kwargs):
    """Queue an email task without letting a broker outage (Celery/Redis
    unreachable) fail the request that triggered it."""
    try:
        send_email_task.delay(*args, **kwargs)
    except Exception:
        logger.exception("Failed to queue email task (trigger=%s)", kwargs.get("trigger"))


STATUS_LABELS = {
    "draft": "Draft",
    "sent": "Sent",
    "received": "Received",
    "cancelled": "Cancelled",
}


def _rfq_staff_recipients():
    """Internal recipients for RFQ notifications: superusers (always) plus
    users whose role is on the notification list (managed via
    NotificationRole, e.g. through the Django admin). Evaluated at send
    time."""
    from django.db.models import Q
    from apps.users.models import User
    from apps.notifications.models import NotificationRole

    role_ids = NotificationRole.objects.filter(role__is_active=True).values("role_id")
    users = User.objects.filter(is_active=True).exclude(email="").filter(
        Q(is_superuser=True) | Q(user_roles__role_id__in=role_ids)
    ).distinct()
    return list(users.values_list("email", flat=True))


def send_new_rfq_notification(rfq):
    """Notify staff that a new RFQ has been created — otherwise they only
    find out by polling the RFQ list."""
    recipients = _rfq_staff_recipients()
    if not recipients:
        return

    item_count = rfq.items.count()
    text = (
        f"A new RFQ has been created.\n\n"
        f"RFQ: {rfq.rfq_number}\n"
        f"Vendor: {rfq.vendor.name if rfq.vendor else '-'}\n"
        f"Items: {item_count}\n\n"
        f"View it at {settings.FRONTEND_URL}\n"
    )
    html = render_to_string("emails/new_rfq_notification.html", {
        "rfq": rfq, "item_count": item_count, "frontend_url": settings.FRONTEND_URL,
    })
    _dispatch_email(
        recipients,
        subject=f"New RFQ created: {rfq.rfq_number}",
        message_text=text,
        html_message=html,
        trigger=EmailLog.Trigger.NEW_RFQ,
    )


def send_rfq_status_email(rfq, old_status, new_status):
    """Notify staff that an RFQ's status has changed."""
    recipients = _rfq_staff_recipients()
    if not recipients:
        return

    old_label = STATUS_LABELS.get(old_status, old_status)
    new_label = STATUS_LABELS.get(new_status, new_status)

    text = (
        f'RFQ {rfq.rfq_number} ({rfq.vendor.name if rfq.vendor else "-"}) changed status '
        f'from "{old_label}" to "{new_label}".\n\n'
        f"View it at {settings.FRONTEND_URL}\n"
    )
    html = render_to_string("emails/rfq_status_change_staff.html", {
        "rfq": rfq, "old_label": old_label, "new_label": new_label,
        "frontend_url": settings.FRONTEND_URL,
    })
    _dispatch_email(
        recipients,
        subject=f"RFQ {rfq.rfq_number} status changed: {new_label}",
        message_text=text,
        html_message=html,
        trigger=EmailLog.Trigger.RFQ_STATUS_CHANGE,
    )
