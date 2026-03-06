from rest_framework import viewsets
from apps.core.permissions import IsAdminOrSuperuser
from .models import RoleModule
from .serializers import RoleModuleSerializer

class RoleModuleViewSet(viewsets.ModelViewSet):
    queryset = RoleModule.objects.all().select_related("role", "module")
    serializer_class = RoleModuleSerializer
    permission_classes = [IsAdminOrSuperuser]
    filterset_fields = ["role", "module"]
