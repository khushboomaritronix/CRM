# from rest_framework import serializers
# from .models import Payment


# class PaymentSerializer(serializers.ModelSerializer):
#     customer_name = serializers.ReadOnlyField(source="customer.name")
#     vendor_name = serializers.ReadOnlyField(source="vendor.name")

#     class Meta:
#         model = Payment
#         fields = "__all__"
#         read_only_fields = ["created_at", "updated_at"]
from rest_framework import serializers
from django.db.models import Sum
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    customer_name = serializers.ReadOnlyField(source="customer.name")
    vendor_name = serializers.ReadOnlyField(source="vendor.name")
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    currency_symbol = serializers.CharField(source="currency.symbol", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):

        payment = super().create(validated_data)

        proforma = payment.proforma

        if proforma:

            total_paid = proforma.payments.aggregate(
                total=Sum("amount")
            )["total"] or 0

            proforma.paid_amount = total_paid

            if total_paid >= proforma.total:
                proforma.status = "paid"

            elif total_paid > 0:
                proforma.status = "partial"

            proforma.save()

        return payment