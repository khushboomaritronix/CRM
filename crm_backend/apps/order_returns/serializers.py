from rest_framework import serializers
from .models import OrderReturn, OrderReturnItem


class OrderReturnItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderReturnItem
        fields = ["id", "description", "quantity", "unit", "unit_price", "tax_percent", "amount", "order"]


class OrderReturnSerializer(serializers.ModelSerializer):
    items = OrderReturnItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")
    vendor_name = serializers.ReadOnlyField(source="vendor.name")

    class Meta:
        model = OrderReturn
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_items(self, instance, items_data):
        instance.items.all().delete()
        for item in items_data:
            item.pop("id", None)
            OrderReturnItem.objects.create(order_return=instance, **item)
        instance.recalculate()

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        obj = OrderReturn.objects.create(**validated_data)
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
