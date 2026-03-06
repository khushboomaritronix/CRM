from rest_framework import serializers
from .models import RFQ, RFQItem


class RFQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQItem
        exclude = ["rfq"]


class RFQSerializer(serializers.ModelSerializer):
    items = RFQItemSerializer(many=True, required=False)
    vendor_name = serializers.ReadOnlyField(source="vendor.name")

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
