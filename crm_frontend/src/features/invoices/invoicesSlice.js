import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("invoices", "/invoices");

export const {
  fetchAll: fetchInvoices,
  fetchOne: fetchOneInvoices,
  createOne: createInvoices,
  updateOne: updateInvoices,
  deleteOne: deleteInvoices,
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
