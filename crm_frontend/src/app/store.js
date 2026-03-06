import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import rolesReducer from "../features/roles/rolesSlice";
import permissionsReducer from "../features/permissions/permissionsSlice";
import modulesReducer from "../features/modules/modulesSlice";
import customersReducer from "../features/customers/customersSlice";
import vendorsReducer from "../features/vendors/vendorsSlice";
import rfqReducer from "../features/rfq/rfqSlice";
import estimatesReducer from "../features/estimates/estimatesSlice";
import invoicesReducer from "../features/invoices/invoicesSlice";
import proformaReducer from "../features/proformaInvoices/proformaInvoicesSlice";
import purchaseOrdersReducer from "../features/purchaseOrders/purchaseOrdersSlice";
import finalInvoicesReducer from "../features/finalInvoices/finalInvoicesSlice";
import companyReducer from "../features/company/companySlice";
import pdfTemplatesReducer from "../features/pdfTemplates/pdfTemplatesSlice";
import customFieldsReducer from "../features/customFields/customFieldsSlice";
import creditNotesReducer from "../features/creditNotes/creditNotesSlice";
import debitNotesReducer from "../features/debitNotes/debitNotesSlice";
import paymentsReducer from "../features/payments/paymentsSlice";
import orderReturnsReducer from "../features/orderReturns/orderReturnsSlice";
import customerPosReducer from "../features/customerPos/customerPosSlice";
import currenciesReducer from "../features/currencies/currenciesSlice";
import bulkOperationsReducer from "../features/bulkOperations/bulkOperationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    modules: modulesReducer,
    customers: customersReducer,
    vendors: vendorsReducer,
    rfq: rfqReducer,
    estimates: estimatesReducer,
    invoices: invoicesReducer,
    proformaInvoices: proformaReducer,
    purchaseOrders: purchaseOrdersReducer,
    finalInvoices: finalInvoicesReducer,
    company: companyReducer,
    pdfTemplates: pdfTemplatesReducer,
    customFields: customFieldsReducer,
    bulkOperations: bulkOperationsReducer,
    creditNotes: creditNotesReducer,
    debitNotes: debitNotesReducer,
    payments: paymentsReducer,
    orderReturns: orderReturnsReducer,
    customerPos: customerPosReducer,
    currencies: currenciesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
