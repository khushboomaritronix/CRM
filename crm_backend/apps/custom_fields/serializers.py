from rest_framework import serializers
from .models import CustomField

class CustomFieldSerializer(serializers.ModelSerializer):
    module_name = serializers.ReadOnlyField(source="module.name")
    module_slug = serializers.ReadOnlyField(source="module.slug")
    class Meta:
        model = CustomField
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
