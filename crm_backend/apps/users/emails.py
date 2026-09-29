import logging

from django.conf import settings
from django.template.loader import render_to_string

from apps.notifications.models import EmailLog
from apps.notifications.tasks import send_email_task

logger = logging.getLogger(__name__)


def _dispatch_email(*args, **kwargs):
    """Queue an email task without letting a broker outage (Celery/Redis
    unreachable) fail the request that triggered it — email delivery is a
    side effect, not something that should block account operations from
    completing."""
    try:
        send_email_task.delay(*args, **kwargs)
    except Exception:
        logger.exception("Failed to queue email task (trigger=%s)", kwargs.get("trigger"))


def send_account_created_email(user, password):
    """
    Sent when a new user account is created — the account owner never typed
    this password themselves, so it has to be relayed to them along with
    their login email. `password` is the plaintext value generated at create
    time, captured before it's hashed — never stored.
    """
    frontend_url = settings.FRONTEND_URL
    html = render_to_string("emails/account_created.html", {
        "full_name": user.full_name, "email": user.email,
        "password": password, "frontend_url": frontend_url,
    })
    _dispatch_email(
        [user.email],
        subject="Your CRM account has been created",
        message_text=(
            f"Hello {user.full_name},\n\n"
            f"An account has been created for you on the CRM.\n\n"
            f"Login Email: {user.email}\n"
            f"Temporary Password: {password}\n\n"
            f"Sign in at {frontend_url}/login\n\n"
            f"For your security, please change this password as soon as possible."
        ),
        html_message=html,
        trigger=EmailLog.Trigger.ACCOUNT_CREATED,
    )


def send_password_changed_email(user):
    """Sent whenever a password actually changes (self-service change or an
    admin reset), so the account owner can notice a change they didn't
    make."""
    html = render_to_string("emails/password_changed.html", {
        "full_name": user.full_name, "frontend_url": settings.FRONTEND_URL,
    })
    _dispatch_email(
        [user.email],
        subject="Your CRM password was changed",
        message_text=(
            f"Hello {user.full_name},\n\n"
            f"This is a confirmation that your CRM password was just changed.\n\n"
            f"If you did not make this change, contact your administrator immediately."
        ),
        html_message=html,
        trigger=EmailLog.Trigger.PASSWORD_CHANGED,
    )
