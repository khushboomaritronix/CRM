from rest_framework import viewsets
from apps.core.permissions import IsAdminOrSuperuser
from apps.core.services import PermissionCacheService
from .models import RoleUser
from .serializers import RoleUserSerializer

class RoleUserViewSet(viewsets.ModelViewSet):
    queryset = RoleUser.objects.all().select_related("role", "user")
    serializer_class = RoleUserSerializer
    permission_classes = [IsAdminOrSuperuser]
    filterset_fields = ["role", "user"]

    def perform_create(self, serializer):
        instance = serializer.save()
        PermissionCacheService.clear_user_permissions(instance.user_id)

    def perform_update(self, serializer):
        instance = serializer.save()
        PermissionCacheService.clear_user_permissions(instance.user_id)

    def perform_destroy(self, instance):
        user_id = instance.user_id
        instance.delete()
        PermissionCacheService.clear_user_permissions(user_id)
