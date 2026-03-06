from rest_framework.routers import DefaultRouter
from .views import RoleUserViewSet
router = DefaultRouter()
router.register("", RoleUserViewSet, basename="role_user")
urlpatterns = router.urls
