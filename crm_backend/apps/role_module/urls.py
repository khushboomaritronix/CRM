from rest_framework.routers import DefaultRouter
from .views import RoleModuleViewSet
router = DefaultRouter()
router.register("", RoleModuleViewSet, basename="role_module")
urlpatterns = router.urls
