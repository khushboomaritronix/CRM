from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, VendorCategoryViewSet
router = DefaultRouter()
# "categories" must be registered before the empty-prefix "" VendorViewSet route,
# otherwise VendorViewSet's own detail route (^(?P<pk>[^/.]+)/$) matches first and
# swallows /categories/ as pk="categories".
router.register("categories", VendorCategoryViewSet, basename="vendor-category")
router.register("", VendorViewSet, basename="vendor")
urlpatterns = router.urls
