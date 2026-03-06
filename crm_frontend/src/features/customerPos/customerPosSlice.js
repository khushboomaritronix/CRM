import { createCRUDSlice } from "../crudSliceFactory";

const { actions, reducer, selectors } = createCRUDSlice("customerPos", "/customer-pos");

export const {
  fetchAll: fetchCustomerPos,
  fetchOne: fetchOneCustomerPos,
  createOne: createCustomerPos,
  updateOne: updateCustomerPos,
  deleteOne: deleteCustomerPos,
  clearSelected,
  clearError,
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
