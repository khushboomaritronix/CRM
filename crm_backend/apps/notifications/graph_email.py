import base64
import logging

import msal
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def get_graph_access_token() -> str:
    """Acquires an app-only (client-credentials) access token for Microsoft Graph."""
    if not (settings.MS_TENANT_ID and settings.MS_CLIENT_ID and settings.MS_CLIENT_SECRET):
        raise RuntimeError(
            "Microsoft Graph is not configured — set MS_TENANT_ID, MS_CLIENT_ID "
            "and MS_CLIENT_SECRET."
        )

    app = msal.ConfidentialClientApplication(
        settings.MS_CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{settings.MS_TENANT_ID}",
        client_credential=settings.MS_CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" not in result:
        raise RuntimeError(f"Could not acquire Graph token: {result.get('error_description')}")
    return result["access_token"]


def send_email_via_graph(recipients, subject, message_text, html_message=None, attachments=None) -> bool:
    """
    Sends an email as settings.DEFAULT_FROM_EMAIL via Microsoft Graph's
    POST /users/{mailbox}/sendMail (app-only auth, so the mailbox needs
    Mail.Send application permission granted, not delegated).

    attachments: optional list of {'filename': str, 'content_bytes': bytes,
    'content_type': str} dicts. Raw bytes in, base64-encoded here — callers
    never handle the encoding themselves.

    Returns True on success, False on failure — never raises, so callers
    can fire-and-forget without email problems blocking the main request.
    """
    try:
        access_token = get_graph_access_token()
    except Exception:
        logger.exception("Failed to acquire Microsoft Graph access token.")
        return False

    email_data = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML" if html_message else "Text",
                "content": html_message or message_text,
            },
            "toRecipients": [{"emailAddress": {"address": r}} for r in recipients],
        },
        "saveToSentItems": "true",
    }

    if attachments:
        email_data["message"]["attachments"] = [
            {
                "@odata.type": "#microsoft.graph.fileAttachment",
                "name": a["filename"],
                "contentType": a.get("content_type", "application/octet-stream"),
                "contentBytes": base64.b64encode(a["content_bytes"]).decode("ascii"),
            }
            for a in attachments
        ]

    graph_url = f"https://graph.microsoft.com/v1.0/users/{settings.DEFAULT_FROM_EMAIL}/sendMail"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(graph_url, headers=headers, json=email_data, timeout=30)
    except requests.RequestException:
        logger.exception("Failed to reach Microsoft Graph sendMail endpoint.")
        return False

    if response.status_code in (200, 202):
        return True

    logger.error("Graph sendMail failed (%s): %s", response.status_code, response.text)
    return False
