from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import RFQ, RFQItem, RFQResponse, RFQResponseItem


class RFQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQItem
        exclude = ["rfq"]


class RFQResponseItemSerializer(serializers.ModelSerializer):
    rfq_item_details = serializers.SerializerMethodField()
    
    class Meta:
        model = RFQResponseItem
        exclude = ["response"]
    
    def get_rfq_item_details(self, obj):
        """Return original RFQ item details"""
        return {
            "id": obj.rfq_item.id,
            "item_name": obj.rfq_item.item_name,
            "original_quantity": obj.rfq_item.quantity,
            "original_unit_price": obj.rfq_item.unit_price,
        }


class RFQResponseSerializer(serializers.ModelSerializer):
    items = RFQResponseItemSerializer(many=True, required=False)
    vendor_name = serializers.ReadOnlyField(source="vendor.name")
    is_deadline_passed = serializers.SerializerMethodField()
    rfq_number = serializers.ReadOnlyField(source="rfq.rfq_number")
    
    class Meta:
        model = RFQResponse
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "converted_to_po_number"]
    
    def get_is_deadline_passed(self, obj):
        return obj.is_deadline_passed()
    
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        response = RFQResponse.objects.create(**validated_data)
        
        for item in items_data:
            RFQResponseItem.objects.create(response=response, **item)
        
        return response
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                RFQResponseItem.objects.create(response=instance, **item)
        
        return instance


class RFQSerializer(serializers.ModelSerializer):
    items = RFQItemSerializer(many=True, required=False)
    responses = RFQResponseSerializer(many=True, read_only=True)
    vendor_name = serializers.ReadOnlyField(source="vendor.name")
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    currency_symbol = serializers.CharField(source="currency.symbol", read_only=True)

    class Meta:
        model = RFQ
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        rfq = RFQ.objects.create(**validated_data)
        for item in items_data:
            RFQItem.objects.create(rfq=rfq, **item)
        rfq.recalculate()
        return rfq

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                RFQItem.objects.create(rfq=instance, **item)
        instance.recalculate()
        return instance
