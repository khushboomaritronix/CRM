from rest_framework import viewsets
from apps.core.permissions import IsAdminOrSuperuser
from .models import Permission
from .serializers import PermissionSerializer

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminOrSuperuser]
