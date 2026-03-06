from rest_framework.routers import DefaultRouter
from .views import OrderReturnViewSet
router = DefaultRouter()
router.register("", OrderReturnViewSet, basename="order-return")
urlpatterns = router.urls
