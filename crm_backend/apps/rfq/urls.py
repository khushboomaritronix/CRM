from rest_framework.routers import DefaultRouter
from .views import RFQViewSet, RFQResponseViewSet

router = DefaultRouter()
router.register("", RFQViewSet, basename="rfq")
router.register("responses", RFQResponseViewSet, basename="rfq-response")

urlpatterns = router.urls
