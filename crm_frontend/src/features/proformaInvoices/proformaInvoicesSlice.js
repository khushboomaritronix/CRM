import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("proformaInvoices", "/proforma-invoices");

export const {
  fetchAll: fetchProformaInvoices,
  fetchOne: fetchOneProformaInvoices,
  createOne: createProformaInvoices,
  updateOne: updateProformaInvoices,
  deleteOne: deleteProformaInvoices,
  clearSelected,
  clearError,
  setSelected,
} = actions;

export const {
  selectList,
  selectSelected,
  selectLoading,
  selectSubmitting,
  selectError,
  selectPagination,
} = selectors;

export default reducer;
