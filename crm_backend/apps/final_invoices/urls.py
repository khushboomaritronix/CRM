from rest_framework.routers import DefaultRouter
from apps.invoices.views import FinalInvoiceViewSet
router = DefaultRouter()
router.register("", FinalInvoiceViewSet, basename="final_invoice")
urlpatterns = router.urls
