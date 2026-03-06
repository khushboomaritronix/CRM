import datetime
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from .models import (
    Estimate, Invoice, ProformaInvoice,
    PurchaseOrder, FinalInvoice,
    FinalInvoiceItem,
)
from .serializers import (
    EstimateSerializer, InvoiceSerializer, ProformaInvoiceSerializer,
    PurchaseOrderSerializer, FinalInvoiceSerializer,
)


class EstimateViewSet(viewsets.ModelViewSet):
    queryset = Estimate.objects.all().prefetch_related("items").select_related("customer")
    serializer_class = EstimateSerializer
    permission_classes = [HasModulePermission]
    module_slug = "estimates"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["estimate_number", "customer__name", "reference"]
    ordering_fields = ["date", "created_at", "total"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().prefetch_related("items").select_related("customer")
    serializer_class = InvoiceSerializer
    permission_classes = [HasModulePermission]
    module_slug = "invoices"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["invoice_number", "customer__name", "reference"]
    ordering_fields = ["date", "due_date", "created_at", "total"]

    @action(detail=True, methods=["post"], url_path="copy-to-final")
    def copy_to_final(self, request, pk=None):
        """Copy invoice data to a new FinalInvoice. User can then adjust it."""
        invoice = self.get_object()
        final_number = request.data.get("final_number", "")
        if not final_number:
            return Response({"detail": "final_number is required."}, status=400)

        final = FinalInvoice.objects.create(
            customer=invoice.customer,
            date=datetime.date.today(),
            due_date=invoice.due_date,
            status="draft",
            reference=invoice.invoice_number,
            notes=invoice.notes,
            terms=invoice.terms,
            currency=invoice.currency,
            discount_percent=invoice.discount_percent,
            discount_amount=invoice.discount_amount,
            final_number=final_number,
            invoice=invoice,
        )
        for item in invoice.items.all():
            FinalInvoiceItem.objects.create(
                final_invoice=final,
                # description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                amount=item.amount,
                order=item.order,
            )
        final.recalculate()
        serializer = FinalInvoiceSerializer(final)
        return Response(serializer.data, status=201)


class ProformaInvoiceViewSet(viewsets.ModelViewSet):
    queryset = ProformaInvoice.objects.all().prefetch_related("items").select_related("customer")
    serializer_class = ProformaInvoiceSerializer
    permission_classes = [HasModulePermission]
    module_slug = "proforma_invoices"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["proforma_number", "customer__name"]
    ordering_fields = ["date", "created_at", "total"]

    @action(detail=True, methods=["post"], url_path="copy-to-final")
    def copy_to_final(self, request, pk=None):
        """Copy proforma data to a new FinalInvoice."""
        proforma = self.get_object()
        final_number = request.data.get("final_number", "")
        if not final_number:
            return Response({"detail": "final_number is required."}, status=400)

        final = FinalInvoice.objects.create(
            customer=proforma.customer,
            date=datetime.date.today(),
            due_date=proforma.due_date,
            status="draft",
            reference=proforma.proforma_number,
            notes=proforma.notes,
            terms=proforma.terms,
            currency=proforma.currency,
            discount_percent=proforma.discount_percent,
            discount_amount=proforma.discount_amount,
            final_number=final_number,
            proforma=proforma,
        )
        for item in proforma.items.all():
            FinalInvoiceItem.objects.create(
                final_invoice=final,
                # description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                amount=item.amount,
                order=item.order,
            )
        final.recalculate()
        serializer = FinalInvoiceSerializer(final)
        return Response(serializer.data, status=201)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().prefetch_related("items").select_related("vendor")
    serializer_class = PurchaseOrderSerializer
    permission_classes = [HasModulePermission]
    module_slug = "purchase_orders"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "vendor"]
    search_fields = ["po_number", "vendor__name"]
    ordering_fields = ["date", "created_at", "total"]


class FinalInvoiceViewSet(viewsets.ModelViewSet):
    queryset = FinalInvoice.objects.all().prefetch_related("items").select_related("customer")
    serializer_class = FinalInvoiceSerializer
    permission_classes = [HasModulePermission]
    module_slug = "final_invoices"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["final_number", "customer__name"]
    ordering_fields = ["date", "created_at", "total"]
