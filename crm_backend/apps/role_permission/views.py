from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.permissions import IsAdminOrSuperuser
from .models import RolePermission
from .serializers import RolePermissionSerializer

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all().select_related("role", "module", "permission")
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdminOrSuperuser]
    filterset_fields = ["role", "module"]

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
        return Response(RolePermissionSerializer(created, many=True).data)
