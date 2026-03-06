from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from apps.core.permissions import IsAdminOrSuperuser
from .models import Role
from .serializers import RoleSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminOrSuperuser]
    filter_backends = [SearchFilter]
    search_fields = ["name"]
