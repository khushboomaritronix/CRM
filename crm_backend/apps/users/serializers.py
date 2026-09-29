import secrets
import string
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_user_permissions_dict(user):
    """Build the {module_slug: [permission_codenames]} map for a user's active roles."""
    from apps.role_user.models import RoleUser
    from apps.role_permission.models import RolePermission

    role_ids = RoleUser.objects.filter(user=user, role__is_active=True).values_list("role_id", flat=True)
    perms = RolePermission.objects.filter(role_id__in=role_ids).select_related("module", "permission")

    permissions = {}
    for p in perms:
        slug = p.module.slug
        if slug not in permissions:
            permissions[slug] = []
        permissions[slug].append(p.permission.codename)
    return permissions


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        data["user"] = UserDetailSerializer(user).data
        data["permissions"] = get_user_permissions_dict(user)
        return data


def get_user_roles(obj):
    """Return roles as clean [{id, name}] list — consistent across all serializers."""
    from apps.role_user.models import RoleUser
    return [
        {"id": ru.role_id, "name": ru.role.name}
        for ru in RoleUser.objects.filter(user=obj).select_related("role")
    ]


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name", "full_name",
            "phone", "is_active", "is_staff", "is_superuser", "roles", "created_at",
        ]

    def get_roles(self, obj):
        return get_user_roles(obj)


class UserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name", "full_name",
            "phone", "avatar", "is_active", "is_staff", "is_superuser",
            "date_joined", "created_at", "updated_at", "roles",
        ]
        read_only_fields = ["date_joined", "created_at", "updated_at"]

    def get_roles(self, obj):
        return get_user_roles(obj)


class UserCreateSerializer(serializers.ModelSerializer):
    role_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True, default=list
    )

    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "phone", "is_active", "is_staff", "role_ids"]

    def create(self, validated_data):
        role_ids = validated_data.pop("role_ids", [])
        raw_pw = generate_password()
        user = User(**validated_data)
        user.set_password(raw_pw)
        user._raw_password = raw_pw
        user.save()

        if role_ids:
            from apps.roles.models import Role
            from apps.role_user.models import RoleUser
            for role_id in role_ids:
                try:
                    role = Role.objects.get(pk=role_id)
                    RoleUser.objects.get_or_create(role=role, user=user)
                except Role.DoesNotExist:
                    pass

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    role_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "phone", "is_active", "is_staff", "role_ids"]

    def update(self, instance, validated_data):
        role_ids = validated_data.pop("role_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if role_ids is not None:
            from apps.roles.models import Role
            from apps.role_user.models import RoleUser
            from apps.core.services import PermissionCacheService
            RoleUser.objects.filter(user=instance).delete()
            for role_id in role_ids:
                try:
                    role = Role.objects.get(pk=role_id)
                    RoleUser.objects.get_or_create(role=role, user=instance)
                except Role.DoesNotExist:
                    pass
            PermissionCacheService.clear_user_permissions(instance.id)

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError("New passwords do not match.")
        return data
