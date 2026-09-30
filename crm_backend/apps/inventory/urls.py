from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, ItemGroupViewSet
router = DefaultRouter()
router.register("items", ItemViewSet, basename="item")
router.register("item-groups", ItemGroupViewSet, basename="item-group")
urlpatterns = router.urls
