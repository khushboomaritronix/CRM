from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related("customer", "vendor")
    serializer_class = PaymentSerializer
    permission_classes = [HasModulePermission]
    module_slug = "payments"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["payment_type", "payment_method", "status", "customer", "vendor"]
    search_fields = ["payment_number", "customer__name", "vendor__name", "invoice_ref", "reference"]
    ordering_fields = ["payment_date", "amount", "created_at"]

    def perform_destroy(self, instance):
        proforma = instance.proforma
        finalinvoice = instance.finalinvoice
        instance.delete()
        PaymentSerializer._sync_document(proforma)
        PaymentSerializer._sync_document(finalinvoice)
