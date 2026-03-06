from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import DebitNote
from .serializers import DebitNoteSerializer


class DebitNoteViewSet(viewsets.ModelViewSet):
    queryset = DebitNote.objects.all().prefetch_related("items").select_related("vendor")
    serializer_class = DebitNoteSerializer
    permission_classes = [HasModulePermission]
    module_slug = "debit_notes"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "vendor"]
    search_fields = ["debit_number", "vendor__name"]
    ordering_fields = ["date", "created_at", "total"]
