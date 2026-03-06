from rest_framework import serializers
from .models import (
    Estimate, EstimateItem, Invoice, InvoiceItem,
    ProformaInvoice, ProformaInvoiceItem,
    PurchaseOrder, PurchaseOrderItem,
    FinalInvoice, FinalInvoiceItem,
)


class BaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["id", "item_name",  "quantity", "unit", "unit_price",
                  "tax_percent", "amount", "order"]


class EstimateItemSerializer(BaseItemSerializer):
    class Meta(BaseItemSerializer.Meta):
        model = EstimateItem


class EstimateSerializer(serializers.ModelSerializer):
    items = EstimateItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = Estimate
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            EstimateItem.objects.create(estimate=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = Estimate.objects.create(**validated_data)
        self._handle_items(obj, items_data)
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._handle_items(instance, items_data)
        return instance


class InvoiceItemSerializer(BaseItemSerializer):
    class Meta(BaseItemSerializer.Meta):
        model = InvoiceItem


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            InvoiceItem.objects.create(invoice=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = Invoice.objects.create(**validated_data)
        self._handle_items(obj, items_data)
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._handle_items(instance, items_data)
        return instance


class ProformaItemSerializer(BaseItemSerializer):
    class Meta(BaseItemSerializer.Meta):
        model = ProformaInvoiceItem


class ProformaInvoiceSerializer(serializers.ModelSerializer):
    items = ProformaItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = ProformaInvoice
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            ProformaInvoiceItem.objects.create(proforma=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = ProformaInvoice.objects.create(**validated_data)
        self._handle_items(obj, items_data)
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._handle_items(instance, items_data)
        return instance


class POItemSerializer(BaseItemSerializer):
    class Meta(BaseItemSerializer.Meta):
        model = PurchaseOrderItem


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = POItemSerializer(many=True, required=False)
    vendor_name = serializers.ReadOnlyField(source="vendor.name")

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            PurchaseOrderItem.objects.create(purchase_order=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = PurchaseOrder.objects.create(**validated_data)
        self._handle_items(obj, items_data)
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._handle_items(instance, items_data)
        return instance


class FinalInvoiceItemSerializer(BaseItemSerializer):
    class Meta(BaseItemSerializer.Meta):
        model = FinalInvoiceItem


class FinalInvoiceSerializer(serializers.ModelSerializer):
    items = FinalInvoiceItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")

    class Meta:
        model = FinalInvoice
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            FinalInvoiceItem.objects.create(final_invoice=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = FinalInvoice.objects.create(**validated_data)
        self._handle_items(obj, items_data)
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._handle_items(instance, items_data)
        return instance
