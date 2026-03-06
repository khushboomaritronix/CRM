"""
apps/users/signals.py — fixed email handling
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import User


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if not created or not hasattr(instance, "_raw_password"):
        return

    password = instance._raw_password
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")

    message = (
        f"Hello {instance.full_name or instance.email},\n\n"
        f"Your CRM account has been created.\n\n"
        f"Login URL : {frontend_url}/login\n"
        f"Email     : {instance.email}\n"
        f"Password  : {password}\n\n"
        f"Please login and change your password immediately.\n\n"
        f"-- CRM System"
    )

    try:
        send_mail(
            subject="Your CRM Account Credentials",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=False,
        )
        print(f"[EMAIL] Welcome email sent to {instance.email}")
    except Exception as e:
        print(f"[EMAIL] Could not send email to {instance.email}: {e}")
        print(f"[EMAIL] >>> Password for {instance.email}: {password} <<<")
        print(f"[EMAIL] Please share this password manually with the user.")
