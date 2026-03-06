from rest_framework import viewsets
from apps.core.permissions import IsAdminOrSuperuser
from .models import RoleUser
from .serializers import RoleUserSerializer

class RoleUserViewSet(viewsets.ModelViewSet):
    queryset = RoleUser.objects.all().select_related("role", "user")
    serializer_class = RoleUserSerializer
    permission_classes = [IsAdminOrSuperuser]
    filterset_fields = ["role", "user"]
