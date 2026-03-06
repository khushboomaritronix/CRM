from rest_framework import serializers
from .models import RoleModule

class RoleModuleSerializer(serializers.ModelSerializer):
    role_name = serializers.ReadOnlyField(source="role.name")
    module_name = serializers.ReadOnlyField(source="module.name")
    module_slug = serializers.ReadOnlyField(source="module.slug")
    class Meta:
        model = RoleModule
        fields = ["id", "role", "module", "role_name", "module_name", "module_slug", "created_at"]
        read_only_fields = ["created_at"]
