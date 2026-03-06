from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import Customer
from .serializers import CustomerSerializer


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
