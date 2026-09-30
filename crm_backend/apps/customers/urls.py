from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerGroupViewSet
router = DefaultRouter()
# "groups" must be registered before the empty-prefix "" CustomerViewSet route,
# otherwise CustomerViewSet's own detail route (^(?P<pk>[^/.]+)/$) matches first and
# swallows /groups/ as pk="groups".
router.register("groups", CustomerGroupViewSet, basename="customer-group")
router.register("", CustomerViewSet, basename="customer")
urlpatterns = router.urls
