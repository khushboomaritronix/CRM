from rest_framework.permissions import BasePermission
from django.core.cache import cache

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
    Uses Redis caching for performance (30-minute TTL).
    Superusers always have all permissions.
    
    Args:
        user: User instance
        module_slug: Module identifier (e.g., 'customers', 'invoices')
        action: Permission action (e.g., 'can_view', 'can_create')
    
    Returns:
        bool: True if user has permission
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True

    from apps.core.services import PermissionCacheService

    # Get user permissions from cache (builds from DB if not cached)
    permissions = PermissionCacheService.get_user_permissions(user, cache)
    
    # Check if module and action exist in permissions
    if module_slug not in permissions:
        return False
    
    return permissions[module_slug].get(action, False)


class HasModulePermission(BasePermission):
    """
    View-level permission that checks dynamic RBAC with caching.
    Set `module_slug` on the ViewSet class.
    
    Performance: ~1ms per request (cached for 30 minutes)
    Without cache: ~50-100ms per request (database queries)
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
    """Check if user is admin or superuser"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_superuser or request.user.is_staff))
