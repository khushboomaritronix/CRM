import { lazy } from "react";

// ─── Core pages ───────────────────────────────────────────────
const DashboardPage         = lazy(() => import("../pages/dashboard/DashboardPage"));
const ChangePasswordPage   = lazy(() => import("../pages/dashboard/ChangePassword"));

// Customers
const CustomerPOListPage   = lazy(() => import("../pages/customerPos/CustomerPOListPage"));
const CustomerPOFormPage   = lazy(() => import("../pages/customerPos/CustomerPOFormPage"));
const CustomerListPage      = lazy(() => import("../pages/customers/CustomerListPage"));
const CustomerFormPage      = lazy(() => import("../pages/customers/CustomerFormPage"));
const CustomerDetailPage    = lazy(() => import("../pages/customers/CustomerDetailPage"));
const CustomerGroupsPage    = lazy(() => import("../pages/customers/CustomerGroupsPage"));

// Vendors
const VendorListPage        = lazy(() => import("../pages/vendors/VendorListPage"));
const VendorFormPage        = lazy(() => import("../pages/vendors/VendorFormPage"));
const VendorCategoriesPage  = lazy(() => import("../pages/vendors/VendorCategoriesPage"));

// RFQ
const RFQListPage           = lazy(() => import("../pages/rfq/RFQListPage"));
const RFQFormPage           = lazy(() => import("../pages/rfq/RFQFormPage"));

// Estimates
const EstimateListPage      = lazy(() => import("../pages/estimates/EstimateListPage"));
const EstimateFormPage      = lazy(() => import("../pages/estimates/EstimateFormPage"));

// Invoices
const InvoiceListPage       = lazy(() => import("../pages/invoices/InvoiceListPage"));
const InvoiceFormPage       = lazy(() => import("../pages/invoices/InvoiceFormPage"));

// Proforma
const ProformaListPage      = lazy(() => import("../pages/proforma/ProformaListPage"));
const ProformaFormPage      = lazy(() => import("../pages/proforma/ProformaFormPage"));

// Purchase Orders
const POListPage             = lazy(() => import("../pages/purchaseOrders/POListPage"));
const POFormPage             = lazy(() => import("../pages/purchaseOrders/POFormPage"));

// Final Invoices
const FinalInvoiceListPage  = lazy(() => import("../pages/finalInvoices/FinalInvoiceListPage"));
const FinalInvoiceFormPage  = lazy(() => import("../pages/finalInvoices/FinalInvoiceFormPage"));

// Delivery Notes
const DeliveryNoteListPage  = lazy(() => import("../pages/deliveryNotes/DeliveryNoteListPage"));
const DeliveryNoteFormPage  = lazy(() => import("../pages/deliveryNotes/DeliveryNoteFormPage"));

// Modules Management
const ModulesPage           = lazy(() => import("../pages/modules/ModulesPage"));

// ─── NEW modules ─────────────────────────────────────────────
const CreditNoteListPage    = lazy(() => import("../pages/creditNotes/CreditNoteListPage"));
const CreditNoteFormPage    = lazy(() => import("../pages/creditNotes/CreditNoteFormPage"));
const DebitNoteListPage     = lazy(() => import("../pages/debitNotes/DebitNoteListPage"));
const DebitNoteFormPage     = lazy(() => import("../pages/debitNotes/DebitNoteFormPage"));
const PaymentListPage       = lazy(() => import("../pages/payments/PaymentListPage"));
const PaymentFormPage       = lazy(() => import("../pages/payments/PaymentFormPage"));
const OrderReturnListPage   = lazy(() => import("../pages/orderReturns/OrderReturnListPage"));
const OrderReturnFormPage   = lazy(() => import("../pages/orderReturns/OrderReturnFormPage"));
const CurrenciesPage        = lazy(() => import("../pages/currencies/CurrenciesPage"));
const ItemListPage          = lazy(() => import("../pages/inventory/ItemListPage"));
const ItemFormPage          = lazy(() => import("../pages/inventory/ItemFormPage"));
const ItemGroupsPage        = lazy(() => import("../pages/inventory/ItemGroupsPage"));
const ReportsPage           = lazy(() => import("../pages/reports/ReportsPage"));

// ─── Settings ────────────────────────────────────────────────
const CompanySettingsPage   = lazy(() => import("../pages/company/CompanySettingsPage"));
const PDFTemplateListPage   = lazy(() => import("../pages/pdfTemplates/PDFTemplateListPage"));
const PDFTemplateFormPage   = lazy(() => import("../pages/pdfTemplates/PDFTemplateFormPage"));
const UserListPage           = lazy(() => import("../pages/users/UserListPage"));
const UserFormPage           = lazy(() => import("../pages/users/UserFormPage"));
const RoleListPage           = lazy(() => import("../pages/roles/RoleListPage"));
const RoleDetailPage         = lazy(() => import("../pages/roles/RoleDetailPage"));
const CustomFieldsPage       = lazy(() => import("../pages/customFields/CustomFieldsPage"));
const BulkOperationsPage     = lazy(() => import("../pages/bulkOperations/BulkOperationsPage"));

export const moduleRoutes = [
  // Dashboard
  { path: "/dashboard",                    element: <DashboardPage />,         module: "dashboard",         requiredPermission: "can_view" },
  { path: "/change-password",              element: <ChangePasswordPage />,     module: "dashboard",         requiredPermission: "can_view" },

  // Customers
  { path: "/customers",                    element: <CustomerListPage />,       module: "customers",         requiredPermission: "can_view" },
  { path: "/customers/new",                element: <CustomerFormPage />,       module: "customers",         requiredPermission: "can_create" },
  { path: "/customers/:id",               element: <CustomerDetailPage />,     module: "customers",         requiredPermission: "can_view" },
  { path: "/customers/:id/edit",           element: <CustomerFormPage />,       module: "customers",         requiredPermission: "can_update" },
  { path: "/customers/groups",             element: <CustomerGroupsPage />,     module: "customers",         requiredPermission: "can_view" },

  // Customer POs
  { path: "/customer-pos",               element: <CustomerPOListPage />,     module: "customer_pos",      requiredPermission: "can_view" },
  { path: "/customer-pos/new",           element: <CustomerPOFormPage />,     module: "customer_pos",      requiredPermission: "can_create" },
  { path: "/customer-pos/:id/edit",      element: <CustomerPOFormPage />,     module: "customer_pos",      requiredPermission: "can_update" },

  // Vendors
  { path: "/vendors",                      element: <VendorListPage />,         module: "vendors",           requiredPermission: "can_view" },
  { path: "/vendors/new",                  element: <VendorFormPage />,         module: "vendors",           requiredPermission: "can_create" },
  { path: "/vendors/:id/edit",             element: <VendorFormPage />,         module: "vendors",           requiredPermission: "can_update" },
  { path: "/vendors/categories",           element: <VendorCategoriesPage />,   module: "vendors",           requiredPermission: "can_view" },

  // RFQ
  { path: "/rfq",                          element: <RFQListPage />,            module: "rfq",               requiredPermission: "can_view" },
  { path: "/rfq/new",                      element: <RFQFormPage />,            module: "rfq",               requiredPermission: "can_create" },
  { path: "/rfq/:id/edit",                 element: <RFQFormPage />,            module: "rfq",               requiredPermission: "can_update" },

  // Estimates
  { path: "/estimates",                    element: <EstimateListPage />,       module: "estimates",         requiredPermission: "can_view" },
  { path: "/estimates/new",                element: <EstimateFormPage />,       module: "estimates",         requiredPermission: "can_create" },
  { path: "/estimates/:id/edit",           element: <EstimateFormPage />,       module: "estimates",         requiredPermission: "can_update" },

  // Invoices
  { path: "/invoices",                     element: <InvoiceListPage />,        module: "invoices",          requiredPermission: "can_view" },
  { path: "/invoices/new",                 element: <InvoiceFormPage />,        module: "invoices",          requiredPermission: "can_create" },
  { path: "/invoices/:id/edit",            element: <InvoiceFormPage />,        module: "invoices",          requiredPermission: "can_update" },

  // Proforma Invoices
  { path: "/proforma-invoices",            element: <ProformaListPage />,       module: "proforma_invoices", requiredPermission: "can_view" },
  { path: "/proforma-invoices/new",        element: <ProformaFormPage />,       module: "proforma_invoices", requiredPermission: "can_create" },
  { path: "/proforma-invoices/:id/edit",   element: <ProformaFormPage />,       module: "proforma_invoices", requiredPermission: "can_update" },

  // Purchase Orders
  { path: "/purchase-orders",              element: <POListPage />,             module: "purchase_orders",   requiredPermission: "can_view" },
  { path: "/purchase-orders/new",          element: <POFormPage />,             module: "purchase_orders",   requiredPermission: "can_create" },
  { path: "/purchase-orders/:id/edit",     element: <POFormPage />,             module: "purchase_orders",   requiredPermission: "can_update" },

  // Final Invoices
  { path: "/final-invoices",               element: <FinalInvoiceListPage />,   module: "final_invoices",    requiredPermission: "can_view" },
  { path: "/final-invoices/new",           element: <FinalInvoiceFormPage />,   module: "final_invoices",    requiredPermission: "can_create" },
  { path: "/final-invoices/:id/edit",      element: <FinalInvoiceFormPage />,   module: "final_invoices",    requiredPermission: "can_update" },

  // Delivery Notes
  { path: "/delivery-notes",               element: <DeliveryNoteListPage />,   module: "delivery_notes",    requiredPermission: "can_view" },
  { path: "/delivery-notes/new",           element: <DeliveryNoteFormPage />,   module: "delivery_notes",    requiredPermission: "can_create" },
  { path: "/delivery-notes/:id/edit",      element: <DeliveryNoteFormPage />,   module: "delivery_notes",    requiredPermission: "can_update" },

  // ─── NEW ──────────────────────────────────────────────────
  // Credit Notes
  { path: "/credit-notes",                 element: <CreditNoteListPage />,     module: "credit_notes",      requiredPermission: "can_view" },
  { path: "/credit-notes/new",             element: <CreditNoteFormPage />,     module: "credit_notes",      requiredPermission: "can_create" },
  { path: "/credit-notes/:id/edit",        element: <CreditNoteFormPage />,     module: "credit_notes",      requiredPermission: "can_update" },

  // Debit Notes
  { path: "/debit-notes",                  element: <DebitNoteListPage />,      module: "debit_notes",       requiredPermission: "can_view" },
  { path: "/debit-notes/new",              element: <DebitNoteFormPage />,      module: "debit_notes",       requiredPermission: "can_create" },
  { path: "/debit-notes/:id/edit",         element: <DebitNoteFormPage />,      module: "debit_notes",       requiredPermission: "can_update" },

  // Payments
  { path: "/payments",                     element: <PaymentListPage />,        module: "payments",          requiredPermission: "can_view" },
  { path: "/payments/new",                 element: <PaymentFormPage />,        module: "payments",          requiredPermission: "can_create" },
  { path: "/payments/:id/edit",            element: <PaymentFormPage />,        module: "payments",          requiredPermission: "can_update" },

  // Order Returns
  { path: "/order-returns",                element: <OrderReturnListPage />,    module: "order_returns",     requiredPermission: "can_view" },
  { path: "/order-returns/new",            element: <OrderReturnFormPage />,    module: "order_returns",     requiredPermission: "can_create" },
  { path: "/order-returns/:id/edit",       element: <OrderReturnFormPage />,    module: "order_returns",     requiredPermission: "can_update" },

  // Currencies
  { path: "/currencies",                   element: <CurrenciesPage />,         module: "currencies",        requiredPermission: "can_view" },

  // Inventory
  { path: "/inventory/items",              element: <ItemListPage />,           module: "inventory",         requiredPermission: "can_view" },
  { path: "/inventory/items/new",          element: <ItemFormPage />,           module: "inventory",         requiredPermission: "can_create" },
  { path: "/inventory/items/:id/edit",     element: <ItemFormPage />,           module: "inventory",         requiredPermission: "can_update" },
  { path: "/inventory/item-groups",        element: <ItemGroupsPage />,         module: "inventory",         requiredPermission: "can_view" },

  // Reports
  { path: "/reports",                      element: <ReportsPage />,            module: "reports",           requiredPermission: "can_view" },

  // ─── Settings ─────────────────────────────────────────────
  { path: "/company",                      element: <CompanySettingsPage />,    module: "company",           requiredPermission: "can_view" },
  { path: "/pdf-templates",                element: <PDFTemplateListPage />,    module: "pdf_templates",     requiredPermission: "can_view" },
  { path: "/pdf-templates/new",            element: <PDFTemplateFormPage />,    module: "pdf_templates",     requiredPermission: "can_create" },
  { path: "/pdf-templates/:id/edit",       element: <PDFTemplateFormPage />,    module: "pdf_templates",     requiredPermission: "can_update" },
  { path: "/users",                        element: <UserListPage />,           module: "users",             requiredPermission: "can_view" },
  { path: "/users/new",                    element: <UserFormPage />,           module: "users",             requiredPermission: "can_create" },
  { path: "/users/:id/edit",              element: <UserFormPage />,           module: "users",             requiredPermission: "can_update" },
  { path: "/roles",                        element: <RoleListPage />,           module: "roles",             requiredPermission: "can_view" },
  { path: "/roles/:id",                    element: <RoleDetailPage />,         module: "roles",             requiredPermission: "can_view" },
  { path: "/modules",                      element: <ModulesPage />,            module: "modules",           requiredPermission: "can_view" },
  { path: "/custom-fields",               element: <CustomFieldsPage />,       module: "custom_fields",     requiredPermission: "can_view" },
  { path: "/bulk-operations",              element: <BulkOperationsPage />,     module: "bulk_operations",   requiredPermission: "can_view" },
];
