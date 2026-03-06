from rest_framework.routers import DefaultRouter
from .views import PDFTemplateViewSet
router = DefaultRouter()
router.register("", PDFTemplateViewSet, basename="pdf_template")
urlpatterns = router.urls
