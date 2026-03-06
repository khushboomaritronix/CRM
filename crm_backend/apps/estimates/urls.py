from rest_framework.routers import DefaultRouter
from apps.invoices.views import EstimateViewSet
router = DefaultRouter()
router.register("", EstimateViewSet, basename="estimate")
urlpatterns = router.urls
