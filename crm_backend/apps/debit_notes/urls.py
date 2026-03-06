from rest_framework.routers import DefaultRouter
from .views import DebitNoteViewSet
router = DefaultRouter()
router.register("", DebitNoteViewSet, basename="debit-note")
urlpatterns = router.urls
