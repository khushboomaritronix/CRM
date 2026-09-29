from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView

try:
    from drf_spectacular.views import SpectacularSwaggerUIView
except ImportError:
    try:
        from drf_spectacular.views import SpectacularSwaggerView as SpectacularSwaggerUIView
    except ImportError:
        SpectacularSwaggerUIView = None

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),

    # Auth
    path("api/auth/", include("apps.users.urls")),

    # RBAC
    path("api/roles/", include("apps.roles.urls")),
    path("api/permissions/", include("apps.permissions.urls")),
    path("api/modules/", include("apps.modules.urls")),
    path("api/role-user/", include("apps.role_user.urls")),
    path("api/role-module/", include("apps.role_module.urls")),
    path("api/role-permission/", include("apps.role_permission.urls")),

    # Business Modules
    path("api/customers/", include("apps.customers.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/rfq/", include("apps.rfq.urls")),
    path("api/estimates/", include("apps.estimates.urls")),
    path("api/invoices/", include("apps.invoices.urls")),
    path("api/proforma-invoices/", include("apps.proforma_invoices.urls")),
    path("api/purchase-orders/", include("apps.purchase_orders.urls")),
    path("api/final-invoices/", include("apps.final_invoices.urls")),
    path("api/delivery-notes/", include("apps.delivery_notes.urls")),

    # New Modules
    path("api/credit-notes/", include("apps.credit_notes.urls")),
    path("api/debit-notes/", include("apps.debit_notes.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/order-returns/", include("apps.order_returns.urls")),
    path("api/currencies/", include("apps.currencies.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/customer-pos/", include("apps.customer_pos.urls")),

    # Settings & Features
    path("api/company/", include("apps.company.urls")),
    path("api/pdf-templates/", include("apps.pdf_templates.urls")),
    path("api/bulk/", include("apps.bulk_operations.urls")),
    path("api/custom-fields/", include("apps.custom_fields.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if SpectacularSwaggerUIView:
    urlpatterns += [
        path("api/docs/", SpectacularSwaggerUIView.as_view(url_name="schema"), name="swagger-ui"),
    ]

if settings.DEBUG and "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar

    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
    ]
