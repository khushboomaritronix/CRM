from rest_framework import serializers
from .models import Customer, CustomerGroup


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class CustomerSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    currency_symbol = serializers.CharField(source="currency.symbol", read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
