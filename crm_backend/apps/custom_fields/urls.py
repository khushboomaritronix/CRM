from rest_framework.routers import DefaultRouter
from .views import CustomFieldViewSet
router = DefaultRouter()
router.register("", CustomFieldViewSet, basename="custom_field")
urlpatterns = router.urls
