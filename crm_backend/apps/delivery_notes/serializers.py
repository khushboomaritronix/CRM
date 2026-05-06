from rest_framework import serializers
from django.utils import timezone
from .models import DeliveryNote, DeliveryNoteItem


class DeliveryNoteItemSerializer(serializers.ModelSerializer):
    """Serializer for delivery note line items"""
    
    class Meta:
        model = DeliveryNoteItem
        fields = [
            "id",
            "item_name",
            "description",
            "sku",
            "quantity_ordered",
            "quantity_delivered",
            "unit",
            "unit_price",
            "total_price",
            "batch_number",
            "expiry_date",
            "notes",
            "order",
        ]


class DeliveryNoteSerializer(serializers.ModelSerializer):
    """Serializer for delivery notes"""
    
    items = DeliveryNoteItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True
    )
    customer_email = serializers.CharField(
        source="customer.email",
        read_only=True
    )
    currency_code = serializers.CharField(
        source="currency.code",
        read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True
    )
    
    class Meta:
        model = DeliveryNote
        fields = [
            "id",
            "delivery_number",
            "customer",
            "customer_name",
            "customer_email",
            "currency",
            "currency_code",
            "invoice_reference",
            "po_reference",
            "sales_order_reference",
            "delivery_date",
            "expected_delivery_date",
            "delivered_date",
            "status",
            "delivery_address",
            "delivery_city",
            "delivery_state",
            "delivery_country",
            "delivery_postal_code",
            "tracking_number",
            "carrier",
            "total_items",
            "delivered_items",
            "notes",
            "special_instructions",
            "shipping_cost",
            "insurance_amount",
            "items",
            "created_at",
            "updated_at",
            "created_by_name",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "total_items",
            "delivered_items",
        ]


class DeliveryNoteCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating delivery notes with nested items"""
    
    items = DeliveryNoteItemSerializer(many=True, required=False)
    
    class Meta:
        model = DeliveryNote
        fields = [
            "delivery_number",
            "customer",
            "currency",
            "invoice_reference",
            "po_reference",
            "sales_order_reference",
            "delivery_date",
            "expected_delivery_date",
            "status",
            "delivery_address",
            "delivery_city",
            "delivery_state",
            "delivery_country",
            "delivery_postal_code",
            "tracking_number",
            "carrier",
            "notes",
            "special_instructions",
            "shipping_cost",
            "insurance_amount",
            "items",
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        delivery_note = DeliveryNote.objects.create(**validated_data)
        
        for item_data in items_data:
            DeliveryNoteItem.objects.create(delivery_note=delivery_note, **item_data)
        
        delivery_note.calculate_totals()
        return delivery_note
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                DeliveryNoteItem.objects.create(delivery_note=instance, **item_data)
            instance.calculate_totals()
        
        return instance
