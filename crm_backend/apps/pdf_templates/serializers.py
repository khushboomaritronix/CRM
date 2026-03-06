from rest_framework import serializers
from .models import PDFTemplate

class PDFTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFTemplate
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
