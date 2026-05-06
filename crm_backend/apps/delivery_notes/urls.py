from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DeliveryNoteViewSet

router = DefaultRouter()
router.register("", DeliveryNoteViewSet, basename="delivery_note")

urlpatterns = router.urls
