"""
Reports app views and API endpoints - Complete implementation
"""

from datetime import datetime, timedelta, date
from decimal import Decimal
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.core.permissions import HasModulePermission
from apps.invoices.models import Invoice, Estimate, ProformaInvoice, FinalInvoice, PurchaseOrder
from apps.payments.models import Payment
from apps.customers.models import Customer
from apps.vendors.models import Vendor
from .models import SalesReport, PaymentReport, AgingReport, TaxReport, VendorReport, DashboardMetrics
from .serializers import (
    SalesReportSerializer, PaymentReportSerializer, AgingReportSerializer,
    TaxReportSerializer, VendorReportSerializer, DashboardMetricsSerializer
)


# Legacy endpoint for backward compatibility
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get aggregated dashboard statistics"""
        today = date.today()
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)

        def safe_sum(qs, field):
            result = qs.aggregate(total=Sum(field))["total"]
            return float(result or 0)

        invoices = Invoice.objects.all()
        final_invoices = FinalInvoice.objects.all()
        payments = Payment.objects.filter(payment_type="received")

        return Response({
            "totals": {
                "customers": Customer.objects.filter(is_active=True).count(),
                "vendors": Vendor.objects.filter(is_active=True).count(),
                "invoices": invoices.count(),
                "final_invoices": final_invoices.count(),
            },
            "revenue": {
                "this_month": safe_sum(final_invoices.filter(date__gte=month_start), "total"),
                "this_year": safe_sum(final_invoices.filter(date__gte=year_start), "total"),
                "total_paid": safe_sum(final_invoices.filter(status="paid"), "total"),
                "total_outstanding": safe_sum(final_invoices.filter(status__in=["draft", "sent", "partial", "overdue"]), "total"),
            },
            "payments": {
                "received_this_month": safe_sum(payments.filter(payment_date__gte=month_start), "amount"),
                "received_total": safe_sum(payments, "amount"),
            },
            "invoice_status_breakdown": {
                s: invoices.filter(status=s).count()
                for s in ["draft", "sent", "paid", "partial", "overdue", "cancelled"]
            },
        })


class SalesReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Sales reports and analytics"""
    
    queryset = SalesReport.objects.all()
    serializer_class = SalesReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["report_type", "start_date", "end_date"]
    ordering_fields = ["-created_at", "start_date"]
    
    @action(detail=False, methods=["post"], url_path="generate")
    def generate_report(self, request):
        """Generate a new sales report"""
        report_type = request.data.get("report_type", "monthly")
        start_date_str = request.data.get("start_date")
        end_date_str = request.data.get("end_date")
        
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Fetch invoices in date range
        invoices = FinalInvoice.objects.filter(
            date__range=[start_date, end_date]
        ).select_related("customer")
        
        # Calculate totals
        invoice_stats = invoices.aggregate(
            count=Count("id"),
            total_revenue=Sum("total"),
            total_paid=Sum("paid_amount"),
        )
        
        total_outstanding = (invoice_stats["total_revenue"] or 0) - (invoice_stats["total_paid"] or 0)
        
        # Build summary by customer if requested
        summary_data = {}
        if report_type == "by_customer":
            for customer in Customer.objects.filter(invoices__date__range=[start_date, end_date]).distinct():
                customer_invoices = invoices.filter(customer=customer)
                customer_stats = customer_invoices.aggregate(
                    revenue=Sum("total"),
                    paid=Sum("paid_amount")
                )
                summary_data[str(customer.id)] = {
                    "customer_name": customer.name,
                    "revenue": float(customer_stats["revenue"] or 0),
                    "paid": float(customer_stats["paid"] or 0),
                    "outstanding": float((customer_stats["revenue"] or 0) - (customer_stats["paid"] or 0))
                }
        
        report = SalesReport.objects.create(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            total_invoices=invoice_stats.get("count", 0),
            total_revenue=invoice_stats.get("total_revenue", 0) or Decimal(0),
            total_paid=invoice_stats.get("total_paid", 0) or Decimal(0),
            total_outstanding=Decimal(str(total_outstanding)),
            summary_data=summary_data,
            created_by=request.user
        )
        
        return Response(
            SalesReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )


class PaymentReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Payment reports and cash flow analysis"""
    
    queryset = PaymentReport.objects.all()
    serializer_class = PaymentReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["start_date", "end_date"]
    ordering_fields = ["-created_at"]
    
    @action(detail=False, methods=["post"], url_path="generate")
    def generate_report(self, request):
        """Generate payment report for date range"""
        start_date_str = request.data.get("start_date")
        end_date_str = request.data.get("end_date")
        
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Payments received from customers
        payments_received = Payment.objects.filter(
            payment_type="received",
            payment_date__range=[start_date, end_date]
        ).aggregate(total=Sum("amount"))
        
        # Payments made to vendors
        payments_made = Payment.objects.filter(
            payment_type="made",
            payment_date__range=[start_date, end_date]
        ).aggregate(total=Sum("amount"))
        
        # Outstanding from unpaid invoices
        unpaid_invoices = FinalInvoice.objects.filter(
            date__lt=start_date,
            paid_amount__lt=F("total")
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        # Overdue invoices (past due date, still unpaid)
        overdue_invoices = FinalInvoice.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=["unpaid", "partial"]
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        report = PaymentReport.objects.create(
            start_date=start_date,
            end_date=end_date,
            total_received=payments_received.get("total", 0) or Decimal(0),
            total_paid=payments_made.get("total", 0) or Decimal(0),
            total_pending=unpaid_invoices.get("total", 0) or Decimal(0),
            total_overdue=overdue_invoices.get("total", 0) or Decimal(0),
            summary_data={},
            created_by=request.user
        )
        
        return Response(
            PaymentReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )


class AgingReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Invoice aging analysis"""
    
    queryset = AgingReport.objects.all()
    serializer_class = AgingReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"
    
    @action(detail=False, methods=["post"], url_path="generate")
    def generate_report(self, request):
        """Generate aging report (invoice age analysis)"""
        today = timezone.now().date()
        
        # Get unpaid/partially paid invoices
        outstanding_invoices = FinalInvoice.objects.filter(
            Q(status="unpaid") | Q(status="partial"),
            created_at__isnull=False
        )
        
        # Categorize by age
        current_0_30 = outstanding_invoices.filter(
            due_date__gte=today - timedelta(days=30),
            due_date__lte=today
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        current_31_60 = outstanding_invoices.filter(
            due_date__gte=today - timedelta(days=60),
            due_date__lt=today - timedelta(days=30)
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        current_61_90 = outstanding_invoices.filter(
            due_date__gte=today - timedelta(days=90),
            due_date__lt=today - timedelta(days=60)
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        overdue_90 = outstanding_invoices.filter(
            due_date__lt=today - timedelta(days=90)
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        
        total = (
            (current_0_30.get("total") or 0) +
            (current_31_60.get("total") or 0) +
            (current_61_90.get("total") or 0) +
            (overdue_90.get("total") or 0)
        )
        
        report = AgingReport.objects.create(
            current_0_30_days=current_0_30.get("total", 0) or Decimal(0),
            current_31_60_days=current_31_60.get("total", 0) or Decimal(0),
            current_61_90_days=current_61_90.get("total", 0) or Decimal(0),
            overdue_90_plus=overdue_90.get("total", 0) or Decimal(0),
            total_outstanding=Decimal(str(total)),
            summary_data={},
            created_by=request.user
        )
        
        return Response(
            AgingReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )


class DashboardMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """Real-time dashboard metrics"""
    
    queryset = DashboardMetrics.objects.all()
    serializer_class = DashboardMetricsSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"
    
    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current dashboard metrics"""
        today = timezone.now().date()
        
        # Get or create today's metrics
        metrics, created = DashboardMetrics.objects.get_or_create(metric_date=today)
        
        # Update metrics
        metrics.total_customers = Customer.objects.filter(is_active=True).count()
        metrics.total_vendors = Vendor.objects.filter(is_active=True).count()
        metrics.total_invoices = FinalInvoice.objects.count()
        metrics.total_purchase_orders = PurchaseOrder.objects.count()
        
        # Today's revenue
        today_revenue = FinalInvoice.objects.filter(date=today).aggregate(
            total=Sum("total")
        )
        metrics.revenue_today = today_revenue.get("total", 0) or Decimal(0)
        
        # This month's revenue
        month_start = today.replace(day=1)
        month_revenue = FinalInvoice.objects.filter(
            date__gte=month_start,
            date__lte=today
        ).aggregate(total=Sum("total"))
        metrics.revenue_this_month = month_revenue.get("total", 0) or Decimal(0)
        
        # This year's revenue
        year_start = today.replace(month=1, day=1)
        year_revenue = FinalInvoice.objects.filter(
            date__gte=year_start,
            date__lte=today
        ).aggregate(total=Sum("total"))
        metrics.revenue_this_year = year_revenue.get("total", 0) or Decimal(0)
        
        # Today's payments
        today_payments = Payment.objects.filter(
            payment_type="received",
            payment_date=today
        ).aggregate(total=Sum("amount"))
        metrics.payments_received_today = today_payments.get("total", 0) or Decimal(0)
        
        # This month's payments
        month_payments = Payment.objects.filter(
            payment_type="received",
            payment_date__gte=month_start,
            payment_date__lte=today
        ).aggregate(total=Sum("amount"))
        metrics.payments_received_month = month_payments.get("total", 0) or Decimal(0)
        
        # Outstanding invoices
        outstanding = FinalInvoice.objects.filter(
            Q(status="unpaid") | Q(status="partial")
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        metrics.outstanding_total = outstanding.get("total", 0) or Decimal(0)
        
        # Overdue invoices
        overdue = FinalInvoice.objects.filter(
            status__in=["unpaid", "partial"],
            due_date__lt=today
        ).aggregate(total=Sum(F("total") - F("paid_amount")))
        metrics.overdue_total = overdue.get("total", 0) or Decimal(0)
        
        metrics.save()
        
        return Response(DashboardMetricsSerializer(metrics).data)


class TaxReportViewSet(viewsets.ReadOnlyModelViewSet):
    """GST/Tax reports for compliance"""
    
    queryset = TaxReport.objects.all()
    serializer_class = TaxReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"


class VendorReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Vendor/supplier analysis and spending"""
    
    queryset = VendorReport.objects.all()
    serializer_class = VendorReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_slug = "reports"


class SalesReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        qs = FinalInvoice.objects.all()
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        by_customer = (
            qs.values("customer__name")
            .annotate(total=Sum("total"), count=Count("id"))
            .order_by("-total")[:20]
        )
        by_month = (
            qs.extra(select={"month": "DATE_TRUNC('month', date)"})
            .values("month")
            .annotate(total=Sum("total"), count=Count("id"))
            .order_by("month")
        )
        return Response({
            "summary": {
                "total_amount": float(qs.aggregate(t=Sum("total"))["t"] or 0),
                "total_invoices": qs.count(),
                "average": float(qs.aggregate(t=Sum("total"))["t"] or 0) / max(qs.count(), 1),
            },
            "by_customer": list(by_customer),
            "by_month": [{"month": str(r["month"])[:7] if r["month"] else "", "total": float(r["total"] or 0), "count": r["count"]} for r in by_month],
        })


class PaymentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        payment_type = request.query_params.get("payment_type", "")
        qs = Payment.objects.all()
        if date_from:
            qs = qs.filter(payment_date__gte=date_from)
        if date_to:
            qs = qs.filter(payment_date__lte=date_to)
        if payment_type:
            qs = qs.filter(payment_type=payment_type)

        by_method = (
            qs.values("payment_method")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )
        return Response({
            "summary": {
                "total": float(qs.aggregate(t=Sum("amount"))["t"] or 0),
                "count": qs.count(),
            },
            "by_method": [{"method": r["payment_method"], "total": float(r["total"] or 0), "count": r["count"]} for r in by_method],
        })


class OutstandingReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        outstanding = FinalInvoice.objects.filter(
            status__in=["sent", "partial", "overdue"]
        ).select_related("customer").order_by("due_date")

        data = []
        for inv in outstanding:
            days_overdue = (today - inv.due_date).days if inv.due_date and inv.due_date < today else 0
            data.append({
                "id": inv.id,
                "number": inv.final_number,
                "customer": inv.customer.name,
                "date": str(inv.date),
                "due_date": str(inv.due_date) if inv.due_date else None,
                "total": float(inv.total),
                "paid_amount": float(inv.paid_amount),
                "balance": float(inv.total - inv.paid_amount),
                "days_overdue": max(0, days_overdue),
                "status": inv.status,
            })
        return Response({"outstanding": data, "total_outstanding": sum(r["balance"] for r in data)})
