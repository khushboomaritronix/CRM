from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import CustomerPO
from .serializers import CustomerPOSerializer


class CustomerPOViewSet(viewsets.ModelViewSet):
    queryset = CustomerPO.objects.all().select_related("customer")
    serializer_class = CustomerPOSerializer
    permission_classes = [HasModulePermission]
    module_slug = "customer_pos"
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["po_number", "our_reference", "customer__name", "description"]
    ordering_fields = ["date", "created_at", "amount"]

    def get_serializer_context(self):
        return {"request": self.request}
