from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import OrderReturn
from .serializers import OrderReturnSerializer


class OrderReturnViewSet(viewsets.ModelViewSet):
    queryset = OrderReturn.objects.all().prefetch_related("items").select_related("customer", "vendor")
    serializer_class = OrderReturnSerializer
    permission_classes = [HasModulePermission]
    module_slug = "order_returns"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "return_type", "customer", "vendor"]
    search_fields = ["return_number", "customer__name", "vendor__name"]
    ordering_fields = ["date", "created_at", "total"]
