from rest_framework.permissions import BasePermission

METHOD_TO_ACTION = {
    "GET": "can_view",
    "POST": "can_create",
    "PUT": "can_update",
    "PATCH": "can_update",
    "DELETE": "can_delete",
}


def check_user_permission(user, module_slug, action):
    """
    Check if user has permission for action on module.
    Superusers always have all permissions.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True

    # Late imports to avoid circular dependency at startup
    from apps.role_user.models import RoleUser
    from apps.role_permission.models import RolePermission

    role_ids = RoleUser.objects.filter(user=user, role__is_active=True).values_list(
        "role_id", flat=True
    )
    return RolePermission.objects.filter(
        role_id__in=role_ids,
        module__slug=module_slug,
        permission__codename=action,
    ).exists()


class HasModulePermission(BasePermission):
    """
    View-level permission that checks dynamic RBAC.
    Set `module_slug` on the ViewSet class.
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        module_slug = getattr(view, "module_slug", None)
        if not module_slug:
            return request.user.is_superuser
        action = METHOD_TO_ACTION.get(request.method, "can_view")
        return check_user_permission(request.user, module_slug, action)


class IsAdminOrSuperuser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_superuser or request.user.is_staff))
