from django.db import models
from apps.core.models import TimeStampedModel
from apps.roles.models import Role
from apps.modules.models import Module
from apps.permissions.models import Permission

class RolePermission(TimeStampedModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="module_permissions")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="permission_roles")
    class Meta:
        unique_together = ("role", "module", "permission")
    def __str__(self):
        return f"{self.role} | {self.module} | {self.permission.codename}"
