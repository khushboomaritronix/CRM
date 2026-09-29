from decimal import Decimal
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

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    @staticmethod
    def _sync_document(document):
        """Recalculate a linked ProformaInvoice/FinalInvoice's paid_amount + status."""
        if document is None:
            return
        total_paid = document.payments.aggregate(total=Sum("amount"))["total"] or Decimal(0)
        document.paid_amount = total_paid
        if total_paid >= document.total:
            document.status = "paid"
        elif total_paid > 0:
            document.status = "partial"
        document.save()

    def create(self, validated_data):
        payment = super().create(validated_data)
        self._sync_document(payment.proforma)
        self._sync_document(payment.finalinvoice)
        return payment

    def update(self, instance, validated_data):
        old_proforma = instance.proforma
        old_finalinvoice = instance.finalinvoice
        payment = super().update(instance, validated_data)
        self._sync_document(old_proforma)
        self._sync_document(old_finalinvoice)
        if payment.proforma_id != (old_proforma.id if old_proforma else None):
            self._sync_document(payment.proforma)
        if payment.finalinvoice_id != (old_finalinvoice.id if old_finalinvoice else None):
            self._sync_document(payment.finalinvoice)
        return payment
