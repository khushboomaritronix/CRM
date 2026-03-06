from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsAdminOrSuperuser
from .models import Module
from .serializers import ModuleSerializer

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.filter(is_active=True)
    serializer_class = ModuleSerializer
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        return [IsAdminOrSuperuser()]
