from rest_framework import serializers
from .models import ItemGroup, Item, ItemRate


class ItemGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemGroup
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class ItemRateSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    currency_symbol = serializers.CharField(source="currency.symbol", read_only=True)

    class Meta:
        model = ItemRate
        fields = ["id", "currency", "currency_code", "currency_symbol", "rate"]


class ItemSerializer(serializers.ModelSerializer):
    rates = ItemRateSerializer(many=True, required=False)
    item_group_name = serializers.CharField(source="item_group.name", read_only=True)

    class Meta:
        model = Item
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _handle_rates(self, instance, rates_data):
        instance.rates.all().delete()
        for rate in rates_data:
            rate.pop("id", None)
            ItemRate.objects.create(item=instance, **rate)

    def create(self, validated_data):
        rates_data = validated_data.pop("rates", [])
        obj = Item.objects.create(**validated_data)
        self._handle_rates(obj, rates_data)
        return obj

    def update(self, instance, validated_data):
        rates_data = validated_data.pop("rates", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if rates_data is not None:
            self._handle_rates(instance, rates_data)
        return instance
