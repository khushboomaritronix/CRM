from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import Vendor
from .serializers import VendorSerializer
class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [HasModulePermission]
    module_slug = "vendors"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "country"]
    search_fields = ["name", "email", "phone", "company_name", "gstin"]
    ordering_fields = ["name", "created_at"]
