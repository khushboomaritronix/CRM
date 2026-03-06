from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import CreditNote
from .serializers import CreditNoteSerializer


class CreditNoteViewSet(viewsets.ModelViewSet):
    queryset = CreditNote.objects.all().prefetch_related("items").select_related("customer")
    serializer_class = CreditNoteSerializer
    permission_classes = [HasModulePermission]
    module_slug = "credit_notes"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["credit_number", "customer__name"]
    ordering_fields = ["date", "created_at", "total"]
