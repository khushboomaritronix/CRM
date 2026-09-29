from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError
from apps.core.permissions import HasModulePermission
from apps.core.services import RFQService
from .models import RFQ, RFQResponse
from .serializers import RFQSerializer, RFQResponseSerializer
from .emails import send_new_rfq_notification, send_rfq_status_email

class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().prefetch_related("items", "responses").select_related("vendor")
    serializer_class = RFQSerializer
    permission_classes = [HasModulePermission]
    module_slug = "rfq"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "vendor"]
    search_fields = ["rfq_number", "vendor__name", "subject"]
    ordering_fields = ["date", "created_at", "total"]

    def perform_create(self, serializer):
        rfq = serializer.save()
        send_new_rfq_notification(rfq)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        rfq = serializer.save()
        if rfq.status != old_status:
            send_rfq_status_email(rfq, old_status, rfq.status)

    @action(detail=True, methods=["post"])
    def send_rfq(self, request, pk=None):
        """Send RFQ to vendor (mark as sent)"""
        rfq = self.get_object()
        
        if rfq.status != "draft":
            return Response(
                {"error": "Only draft RFQs can be sent"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not rfq.items.exists():
            return Response(
                {"error": "RFQ must have items before sending"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = rfq.status
        rfq.status = "sent"
        rfq.save(update_fields=["status"])

        # Create response placeholder for this vendor
        RFQResponse.objects.get_or_create(
            rfq=rfq,
            vendor=rfq.vendor,
            defaults={
                "status": "pending",
                "response_deadline": rfq.due_date,
            }
        )

        send_rfq_status_email(rfq, old_status, rfq.status)

        return Response(
            {"status": "RFQ sent successfully"},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["post"])
    def record_response(self, request, pk=None):
        """Record vendor response to RFQ"""
        rfq = self.get_object()
        
        if rfq.status != "sent":
            return Response(
                {"error": "Can only record responses for sent RFQs"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response_data = request.data
        
        try:
            response_obj, created = RFQResponse.objects.get_or_create(
                rfq=rfq,
                vendor=rfq.vendor,
                defaults={
                    "status": "responded",
                    "response_date": response_data.get("response_date"),
                    "response_deadline": rfq.due_date,
                    "notes": response_data.get("notes", ""),
                    "subtotal": response_data.get("subtotal", 0),
                    "tax_amount": response_data.get("tax_amount", 0),
                    "total": response_data.get("total", 0),
                }
            )
            
            if not created:
                response_obj.status = "responded"
                response_obj.response_date = response_data.get("response_date", response_obj.response_date)
                response_obj.notes = response_data.get("notes", response_obj.notes)
                response_obj.subtotal = response_data.get("subtotal", response_obj.subtotal)
                response_obj.tax_amount = response_data.get("tax_amount", response_obj.tax_amount)
                response_obj.total = response_data.get("total", response_obj.total)
                response_obj.save()
            
            old_status = rfq.status
            rfq.status = "received"
            rfq.save(update_fields=["status"])
            if rfq.status != old_status:
                send_rfq_status_email(rfq, old_status, rfq.status)

            return Response(
                RFQResponseSerializer(response_obj).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RFQResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing RFQ responses"""
    
    queryset = RFQResponse.objects.all().prefetch_related("items").select_related("rfq", "vendor")
    serializer_class = RFQResponseSerializer
    permission_classes = [HasModulePermission]
    module_slug = "rfq"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "rfq", "vendor"]
    search_fields = ["rfq__rfq_number", "vendor__name"]
    ordering_fields = ["created_at", "response_date", "total"]
    
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        """Accept this RFQ response"""
        response_obj = self.get_object()
        
        try:
            RFQService.accept_rfq_response(response_obj)
            return Response(
                {"status": "Response accepted"},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict if hasattr(e, 'message_dict') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject this RFQ response"""
        response_obj = self.get_object()
        reason = request.data.get("reason", "")
        
        try:
            RFQService.reject_rfq_response(response_obj, reason)
            return Response(
                {"status": "Response rejected"},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict if hasattr(e, 'message_dict') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=["post"])
    def convert_to_purchase_order(self, request, pk=None):
        """Convert accepted RFQ response to Purchase Order"""
        response_obj = self.get_object()
        po_number = request.data.get("po_number")
        
        try:
            po = RFQService.convert_response_to_purchase_order(response_obj, po_number)
            return Response(
                {
                    "status": "Converted to Purchase Order",
                    "po_number": po.po_number,
                    "po_id": po.id,
                },
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict if hasattr(e, 'message_dict') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
