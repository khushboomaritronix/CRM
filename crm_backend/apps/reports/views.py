from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.invoices.models import Invoice, FinalInvoice, PurchaseOrder, ProformaInvoice
from apps.payments.models import Payment
from apps.customers.models import Customer
from apps.vendors.models import Vendor


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
