from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BulkImportView, BulkExportView, BulkTemplateDownloadView, ImportHistoryViewSet

router = DefaultRouter()
router.register("history", ImportHistoryViewSet, basename="import_history")

urlpatterns = [
    path("import/<str:module>/", BulkImportView.as_view(), name="bulk_import"),
    path("export/<str:module>/", BulkExportView.as_view(), name="bulk_export"),
    path("template/<str:module>/", BulkTemplateDownloadView.as_view(), name="bulk_template"),
] + router.urls
