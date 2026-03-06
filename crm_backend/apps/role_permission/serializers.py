from rest_framework import serializers
from .models import RolePermission

class RolePermissionSerializer(serializers.ModelSerializer):
    role_name = serializers.ReadOnlyField(source="role.name")
    module_name = serializers.ReadOnlyField(source="module.name")
    module_slug = serializers.ReadOnlyField(source="module.slug")
    permission_name = serializers.ReadOnlyField(source="permission.name")
    permission_codename = serializers.ReadOnlyField(source="permission.codename")
    class Meta:
        model = RolePermission
        fields = ["id", "role", "module", "permission",
                  "role_name", "module_name", "module_slug",
                  "permission_name", "permission_codename", "created_at"]
        read_only_fields = ["created_at"]
