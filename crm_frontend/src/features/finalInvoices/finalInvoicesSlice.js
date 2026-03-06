import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("finalInvoices", "/final-invoices");

export const {
  fetchAll: fetchFinalInvoices,
  fetchOne: fetchOneFinalInvoices,
  createOne: createFinalInvoices,
  updateOne: updateFinalInvoices,
  deleteOne: deleteFinalInvoices,
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
