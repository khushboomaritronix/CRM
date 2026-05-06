"""
Reports app serializers
"""

from rest_framework import serializers
from .models import SalesReport, PaymentReport, AgingReport, TaxReport, VendorReport, DashboardMetrics


class SalesReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    
    class Meta:
        model = SalesReport
        fields = [
            "id", "report_type", "start_date", "end_date", 
            "total_invoices", "total_revenue", "total_paid", "total_outstanding",
            "summary_data", "created_by", "created_by_name", "created_at"
        ]
        read_only_fields = ["created_at"]


class PaymentReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    
    class Meta:
        model = PaymentReport
        fields = [
            "id", "start_date", "end_date",
            "total_received", "total_paid", "total_pending", "total_overdue",
            "summary_data", "created_by", "created_by_name", "created_at"
        ]
        read_only_fields = ["created_at"]


class AgingReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    
    class Meta:
        model = AgingReport
        fields = [
            "id", "report_date",
            "current_0_30_days", "current_31_60_days", "current_61_90_days", "overdue_90_plus",
            "total_outstanding", "summary_data", "created_by", "created_by_name", "created_at"
        ]
        read_only_fields = ["created_at"]


class TaxReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    
    class Meta:
        model = TaxReport
        fields = [
            "id", "period_type", "period_start", "period_end",
            "total_taxable_sales", "total_tax_collected",
            "total_taxable_purchases", "total_tax_paid",
            "net_tax_payable", "summary_data", "created_by", "created_by_name", "created_at"
        ]
        read_only_fields = ["created_at"]


class VendorReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    
    class Meta:
        model = VendorReport
        fields = [
            "id", "start_date", "end_date",
            "total_purchase_orders", "total_purchase_value", "total_paid", "total_pending",
            "summary_data", "created_by", "created_by_name", "created_at"
        ]
        read_only_fields = ["created_at"]


class DashboardMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetrics
        fields = [
            "id", "metric_date",
            "total_customers", "total_vendors", "total_invoices", "total_purchase_orders",
            "revenue_today", "revenue_this_month", "revenue_this_year",
            "payments_received_today", "payments_received_month",
            "outstanding_total", "overdue_total", "created_at"
        ]
        read_only_fields = ["created_at"]
