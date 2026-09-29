from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.permissions import IsAdminOrSuperuser
from apps.core.services import PermissionCacheService
from .models import RolePermission
from .serializers import RolePermissionSerializer


def _clear_permissions_cache_for_role(role_id):
    from apps.role_user.models import RoleUser

    user_ids = RoleUser.objects.filter(role_id=role_id).values_list("user_id", flat=True)
    for user_id in user_ids:
        PermissionCacheService.clear_user_permissions(user_id)


class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all().select_related("role", "module", "permission")
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdminOrSuperuser]
    filterset_fields = ["role", "module"]

    def perform_create(self, serializer):
        instance = serializer.save()
        _clear_permissions_cache_for_role(instance.role_id)

    def perform_update(self, serializer):
        instance = serializer.save()
        _clear_permissions_cache_for_role(instance.role_id)

    def perform_destroy(self, instance):
        role_id = instance.role_id
        instance.delete()
        _clear_permissions_cache_for_role(role_id)

    @action(detail=False, methods=["post"])
    def bulk_assign(self, request):
        """Assign multiple permissions to a role+module at once."""
        role_id = request.data.get("role")
        module_id = request.data.get("module")
        permission_ids = request.data.get("permissions", [])
        created = []
        for pid in permission_ids:
            obj, _ = RolePermission.objects.get_or_create(
                role_id=role_id, module_id=module_id, permission_id=pid
            )
            created.append(obj)
        if role_id:
            _clear_permissions_cache_for_role(role_id)
        return Response(RolePermissionSerializer(created, many=True).data)
