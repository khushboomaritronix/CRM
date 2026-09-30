from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import Customer, CustomerGroup
from .serializers import CustomerSerializer, CustomerGroupSerializer


class CustomerGroupViewSet(viewsets.ModelViewSet):
    queryset = CustomerGroup.objects.all()
    serializer_class = CustomerGroupSerializer
    permission_classes = [HasModulePermission]
    module_slug = "customers"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name"]


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [HasModulePermission]
    module_slug = "customers"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "billing_country"]
    search_fields = ["name", "email", "phone", "company_name", "gstin"]
    ordering_fields = ["name", "created_at"]
    ordering = ["-created_at"]
