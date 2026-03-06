from rest_framework import viewsets, filters
from apps.core.permissions import HasModulePermission
from .models import Currency
from .serializers import CurrencySerializer


class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [HasModulePermission]
    module_slug = "currencies"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "name"]
    ordering_fields = ["code", "name"]
