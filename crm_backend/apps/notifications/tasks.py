from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.files.storage import default_storage

from .graph_email import send_email_via_graph
from .models import EmailLog

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_email_task(self, recipients, subject, message_text, html_message=None, trigger="",
                     attachment_path=None, attachment_filename=None):
    """
    Runs the actual Microsoft Graph sendMail call on a Celery worker rather
    than the web request process. A failure retries (up to 3 times, 30s
    apart) instead of being dropped, and every attempt is recorded in
    EmailLog regardless of outcome.

    attachment_path is a storage path (e.g. a FileField's .name), not raw
    bytes — Celery arguments are JSON-serialized, so the actual file is read
    from storage here on the worker rather than passed through the broker.
    """
    attachments = None
    if attachment_path:
        try:
            with default_storage.open(attachment_path, "rb") as f:
                attachments = [{
                    "filename": attachment_filename or attachment_path.rsplit("/", 1)[-1],
                    "content_bytes": f.read(),
                    "content_type": "application/pdf",
                }]
        except FileNotFoundError:
            logger.error("Email attachment not found in storage: %s", attachment_path)

    sent = send_email_via_graph(recipients, subject, message_text, html_message, attachments=attachments)

    EmailLog.objects.create(
        trigger=trigger,
        recipients=", ".join(recipients),
        subject=subject,
        status=EmailLog.Status.SENT if sent else EmailLog.Status.FAILED,
        attempt=self.request.retries + 1,
        error="" if sent else "Microsoft Graph sendMail failed — see server logs for detail.",
    )

    if not sent:
        raise self.retry(exc=RuntimeError(f'Graph sendMail failed for trigger "{trigger}"'))
    return True
