import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("purchaseOrders", "/purchase-orders");

export const {
  fetchAll: fetchPurchaseOrders,
  fetchOne: fetchOnePurchaseOrders,
  createOne: createPurchaseOrders,
  updateOne: updatePurchaseOrders,
  deleteOne: deletePurchaseOrders,
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
