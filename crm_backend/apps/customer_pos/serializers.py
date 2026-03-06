from rest_framework import serializers
from .models import CustomerPO


class CustomerPOSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.name")
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomerPO
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None
