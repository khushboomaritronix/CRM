from rest_framework.routers import DefaultRouter
from .views import RolePermissionViewSet
router = DefaultRouter()
router.register("", RolePermissionViewSet, basename="role_permission")
urlpatterns = router.urls
