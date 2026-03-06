from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.name")
    vendor_name = serializers.ReadOnlyField(source="vendor.name")

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
