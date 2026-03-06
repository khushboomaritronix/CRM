from rest_framework.routers import DefaultRouter
from apps.invoices.views import ProformaInvoiceViewSet
router = DefaultRouter()
router.register("", ProformaInvoiceViewSet, basename="proforma")
urlpatterns = router.urls
