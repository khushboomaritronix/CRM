from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from apps.users.models import User
from apps.roles.models import Role
from apps.modules.models import Module
from apps.permissions.models import Permission
from apps.role_user.models import RoleUser
from apps.role_module.models import RoleModule
from apps.role_permission.models import RolePermission


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "first_name", "last_name", "is_staff", "is_superuser", "created_at")
    list_filter = ("is_staff", "is_superuser", "is_active", "created_at")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name",)
    ordering = ("-created_at",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "description", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("-created_at",)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("name", "codename", "description", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "codename")
    ordering = ("-created_at",)


@admin.register(RoleUser)
class RoleUserAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("user__email", "role__name")
    readonly_fields = ("created_at",)


@admin.register(RoleModule)
class RoleModuleAdmin(admin.ModelAdmin):
    list_display = ("role", "module", "created_at")
    list_filter = ("role", "module", "created_at")
    search_fields = ("role__name", "module__name")
    readonly_fields = ("created_at",)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "module", "permission", "created_at")
    list_filter = ("role", "module", "created_at")
    search_fields = ("role__name", "module__name", "permission__name")
    readonly_fields = ("created_at",)
