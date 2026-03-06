from rest_framework import serializers
from .models import RoleUser


class RoleUserSerializer(serializers.ModelSerializer):
    role_name = serializers.ReadOnlyField(source="role.name")
    user_email = serializers.ReadOnlyField(source="user.email")
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = RoleUser
        fields = ["id", "role", "user", "role_name", "user_email", "user_full_name", "created_at"]
        read_only_fields = ["created_at"]

    def get_user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def validate(self, data):
        qs = RoleUser.objects.filter(role=data["role"], user=data["user"])
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This user already has this role.")
        return data
