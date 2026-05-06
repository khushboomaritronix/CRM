from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from apps.core.permissions import HasModulePermission
from .models import DeliveryNote, DeliveryNoteItem
from .serializers import (
    DeliveryNoteSerializer,
    DeliveryNoteCreateUpdateSerializer,
    DeliveryNoteItemSerializer,
)


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing delivery notes
    
    Actions:
    - list: Get all delivery notes
    - create: Create new delivery note
    - retrieve: Get specific delivery note
    - update: Update delivery note
    - destroy: Delete delivery note
    - mark_delivered: Mark as delivered
    - mark_in_transit: Mark as in transit
    - add_items: Add items to delivery note
    """
    
    queryset = DeliveryNote.objects.all().prefetch_related("items").select_related(
        "customer", "currency", "pdf_template"
    )
    permission_classes = [HasModulePermission]
    module_slug = "delivery_notes"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer", "delivery_date"]
    search_fields = ["delivery_number", "customer__name", "invoice_reference"]
    ordering_fields = ["delivery_date", "created_at", "delivery_number"]
    ordering = ["-delivery_date"]
    
    def get_serializer_class(self):
        """Use different serializer for create/update vs retrieve"""
        if self.action in ["create", "update", "partial_update"]:
            return DeliveryNoteCreateUpdateSerializer
        return DeliveryNoteSerializer
    
    @action(detail=True, methods=["post"])
    def mark_in_transit(self, request, pk=None):
        """Mark delivery note as in transit"""
        delivery_note = self.get_object()
        
        if delivery_note.status not in ["draft", "confirmed"]:
            return Response(
                {"error": f"Cannot mark as in transit from {delivery_note.status} status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_note.status = "in_transit"
        delivery_note.save(update_fields=["status"])
        
        return Response(
            {
                "status": "Delivery note marked as in transit",
                "delivery_note": DeliveryNoteSerializer(delivery_note).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["post"])
    def mark_delivered(self, request, pk=None):
        """Mark delivery note as delivered"""
        delivery_note = self.get_object()
        
        if delivery_note.status == "delivered":
            return Response(
                {"error": "Delivery note is already marked as delivered"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not delivery_note.items.exists():
            return Response(
                {"error": "Cannot mark as delivered - no items in delivery note"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get delivered date and items from request
        delivered_date = request.data.get("delivered_date")
        delivered_items = request.data.get("delivered_items")
        
        try:
            delivery_note.mark_delivered(
                delivered_date=delivered_date,
                delivered_items=int(delivered_items) if delivered_items else None
            )
            
            return Response(
                {
                    "status": f"Delivery note marked as {delivery_note.status}",
                    "delivery_note": DeliveryNoteSerializer(delivery_note).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=["post"])
    def add_items(self, request, pk=None):
        """Add items to delivery note"""
        delivery_note = self.get_object()
        
        if delivery_note.status not in ["draft", "confirmed"]:
            return Response(
                {"error": f"Cannot add items to {delivery_note.status} delivery note"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items_data = request.data.get("items", [])
        
        if not items_data:
            return Response(
                {"error": "No items provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_items = []
        errors = []
        
        for idx, item_data in enumerate(items_data):
            try:
                serializer = DeliveryNoteItemSerializer(data=item_data)
                if serializer.is_valid():
                    item = DeliveryNoteItem.objects.create(
                        delivery_note=delivery_note,
                        **serializer.validated_data
                    )
                    created_items.append(DeliveryNoteItemSerializer(item).data)
                else:
                    errors.append(f"Item {idx + 1}: {serializer.errors}")
            except Exception as e:
                errors.append(f"Item {idx + 1}: {str(e)}")
        
        # Recalculate totals
        delivery_note.calculate_totals()
        
        return Response(
            {
                "created_items": created_items,
                "errors": errors,
                "total_items": delivery_note.total_items,
                "message": f"Added {len(created_items)} items"
            },
            status=status.HTTP_201_CREATED if created_items else status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """Confirm delivery note (move from draft to confirmed)"""
        delivery_note = self.get_object()
        
        if delivery_note.status != "draft":
            return Response(
                {"error": f"Only draft delivery notes can be confirmed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not delivery_note.items.exists():
            return Response(
                {"error": "Cannot confirm delivery note without items"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_note.status = "confirmed"
        delivery_note.save(update_fields=["status"])
        
        return Response(
            {
                "status": "Delivery note confirmed",
                "delivery_note": DeliveryNoteSerializer(delivery_note).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel delivery note"""
        delivery_note = self.get_object()
        
        if delivery_note.status == "delivered":
            return Response(
                {"error": "Cannot cancel a delivered delivery note"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_note.status = "cancelled"
        delivery_note.save(update_fields=["status"])
        
        return Response(
            {
                "status": "Delivery note cancelled",
                "delivery_note": DeliveryNoteSerializer(delivery_note).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=["get"])
    def by_customer(self, request):
        """Get delivery notes for a specific customer"""
        customer_id = request.query_params.get("customer_id")
        
        if not customer_id:
            return Response(
                {"error": "customer_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_notes = self.queryset.filter(customer_id=customer_id)
        serializer = self.get_serializer(delivery_notes, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Get all pending deliveries (in_transit and partially_received)"""
        pending_statuses = ["in_transit", "partially_received"]
        delivery_notes = self.queryset.filter(status__in=pending_statuses)
        serializer = self.get_serializer(delivery_notes, many=True)
        
        return Response({
            "count": len(delivery_notes),
            "delivery_notes": serializer.data
        })
    
    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get delivery summary statistics"""
        from django.db.models import Count, Q
        
        summary = {
            "total_delivery_notes": self.queryset.count(),
            "draft": self.queryset.filter(status="draft").count(),
            "confirmed": self.queryset.filter(status="confirmed").count(),
            "in_transit": self.queryset.filter(status="in_transit").count(),
            "delivered": self.queryset.filter(status="delivered").count(),
            "partially_received": self.queryset.filter(status="partially_received").count(),
            "cancelled": self.queryset.filter(status="cancelled").count(),
        }
        
        return Response(summary)
