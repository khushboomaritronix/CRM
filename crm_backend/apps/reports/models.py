"""
Reports app models for business analytics and reporting
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel


class SalesReport(TimeStampedModel):
    """Track and store generated sales reports"""
    
    REPORT_TYPE_CHOICES = [
        ("daily", "Daily Sales"),
        ("weekly", "Weekly Sales"),
        ("monthly", "Monthly Sales"),
        ("quarterly", "Quarterly Sales"),
        ("yearly", "Yearly Sales"),
        ("by_customer", "Sales by Customer"),
        ("by_product", "Sales by Product"),
    ]
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    total_invoices = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_outstanding = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    summary_data = models.JSONField(default=dict, help_text="Aggregated data per period/customer/product")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["report_type", "-created_at"]),
            models.Index(fields=["start_date", "end_date"]),
        ]
    
    def __str__(self):
        return f"{self.get_report_type_display()} ({self.start_date} to {self.end_date})"


class PaymentReport(TimeStampedModel):
    """Track payment receipts and outstanding amounts"""
    
    start_date = models.DateField()
    end_date = models.DateField()
    total_received = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_pending = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_overdue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    summary_data = models.JSONField(default=dict, help_text="Payment details by method, status, etc.")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"Payment Report ({self.start_date} to {self.end_date})"


class AgingReport(TimeStampedModel):
    """Invoice aging analysis - helps track overdue payments"""
    
    report_date = models.DateField(auto_now_add=True)
    current_0_30_days = models.DecimalField(max_digits=14, decimal_places=2, default=0, help_text="Amount due in 0-30 days")
    current_31_60_days = models.DecimalField(max_digits=14, decimal_places=2, default=0, help_text="Amount due in 31-60 days")
    current_61_90_days = models.DecimalField(max_digits=14, decimal_places=2, default=0, help_text="Amount due in 61-90 days")
    overdue_90_plus = models.DecimalField(max_digits=14, decimal_places=2, default=0, help_text="Amount overdue 90+ days")
    total_outstanding = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    summary_data = models.JSONField(default=dict, help_text="Detailed invoice list by age bucket")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ["-report_date"]
    
    def __str__(self):
        return f"Aging Report as of {self.report_date}"


class TaxReport(TimeStampedModel):
    """GST/Tax reporting for compliance"""
    
    TAX_PERIOD_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
    ]
    
    period_type = models.CharField(max_length=20, choices=TAX_PERIOD_CHOICES, default="monthly")
    period_start = models.DateField()
    period_end = models.DateField()
    total_taxable_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_tax_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_taxable_purchases = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_tax_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_tax_payable = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    summary_data = models.JSONField(default=dict, help_text="GST breakdown by rate/type")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ["-period_end"]
        unique_together = ["period_type", "period_start", "period_end"]
    
    def __str__(self):
        return f"Tax Report {self.period_start} to {self.period_end}"


class VendorReport(TimeStampedModel):
    """Vendor/supplier performance and spending analysis"""
    
    start_date = models.DateField()
    end_date = models.DateField()
    total_purchase_orders = models.PositiveIntegerField(default=0)
    total_purchase_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_pending = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    summary_data = models.JSONField(default=dict, help_text="Spending per vendor")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"Vendor Report ({self.start_date} to {self.end_date})"


class DashboardMetrics(TimeStampedModel):
    """Real-time dashboard metrics snapshot"""
    
    metric_date = models.DateField(auto_now_add=True)
    total_customers = models.PositiveIntegerField(default=0)
    total_vendors = models.PositiveIntegerField(default=0)
    total_invoices = models.PositiveIntegerField(default=0)
    total_purchase_orders = models.PositiveIntegerField(default=0)
    revenue_today = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    revenue_this_month = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    revenue_this_year = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payments_received_today = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payments_received_month = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    outstanding_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    overdue_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    
    class Meta:
        ordering = ["-metric_date"]
    
    def __str__(self):
        return f"Dashboard Metrics for {self.metric_date}"
