from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.roles.models import Role


class RoleUser(TimeStampedModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_users")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_roles"
    )

    class Meta:
        unique_together = ("role", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} → {self.role}"
