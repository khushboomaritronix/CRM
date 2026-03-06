from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import RFQ
from .serializers import RFQSerializer

class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().prefetch_related("items").select_related("vendor")
    serializer_class = RFQSerializer
    permission_classes = [HasModulePermission]
    module_slug = "rfq"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "vendor"]
    search_fields = ["rfq_number", "vendor__name", "subject"]
    ordering_fields = ["date", "created_at", "total"]
