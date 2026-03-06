from rest_framework.routers import DefaultRouter
from .views import ModuleViewSet
router = DefaultRouter()
router.register("", ModuleViewSet, basename="module")
urlpatterns = router.urls
