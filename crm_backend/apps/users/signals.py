"""
apps/users/signals.py — new-account email handling
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .emails import send_account_created_email


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if not created or not hasattr(instance, "_raw_password"):
        return
    send_account_created_email(instance, instance._raw_password)
