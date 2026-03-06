from rest_framework.routers import DefaultRouter
from apps.invoices.views import PurchaseOrderViewSet
router = DefaultRouter()
router.register("", PurchaseOrderViewSet, basename="po")
urlpatterns = router.urls
