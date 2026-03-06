from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsAdminOrSuperuser
from .models import CustomField
from .serializers import CustomFieldSerializer

class CustomFieldViewSet(viewsets.ModelViewSet):
    queryset = CustomField.objects.all().select_related("module")
    serializer_class = CustomFieldSerializer
    filterset_fields = ["module", "module__slug", "is_active", "field_type"]
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdminOrSuperuser()]
