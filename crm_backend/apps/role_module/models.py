from django.db import models
from apps.core.models import TimeStampedModel
from apps.roles.models import Role
from apps.modules.models import Module

class RoleModule(TimeStampedModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_modules")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="module_roles")
    class Meta:
        unique_together = ("role", "module")
    def __str__(self):
        return f"{self.role} → {self.module}"
