from rest_framework.routers import DefaultRouter
from .views import RFQViewSet, RFQResponseViewSet

router = DefaultRouter()
router.register("responses", RFQResponseViewSet, basename="rfq-response")
router.register("", RFQViewSet, basename="rfq")

urlpatterns = router.urls
