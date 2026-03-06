from django.urls import path
from .views import DashboardStatsView, SalesReportView, PaymentReportView, OutstandingReportView

urlpatterns = [
    path("dashboard/", DashboardStatsView.as_view(), name="report-dashboard"),
    path("sales/", SalesReportView.as_view(), name="report-sales"),
    path("payments/", PaymentReportView.as_view(), name="report-payments"),
    path("outstanding/", OutstandingReportView.as_view(), name="report-outstanding"),
]
