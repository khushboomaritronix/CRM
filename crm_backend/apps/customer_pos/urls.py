from rest_framework.routers import DefaultRouter
from .views import CustomerPOViewSet

router = DefaultRouter()
router.register("", CustomerPOViewSet, basename="customer-po")
urlpatterns = router.urls
