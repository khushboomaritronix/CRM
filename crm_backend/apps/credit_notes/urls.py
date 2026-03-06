from rest_framework.routers import DefaultRouter
from .views import CreditNoteViewSet

router = DefaultRouter()
router.register("", CreditNoteViewSet, basename="credit-note")
urlpatterns = router.urls
