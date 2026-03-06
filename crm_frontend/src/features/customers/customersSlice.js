import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("customers", "/customers");

export const {
  fetchAll: fetchCustomers,
  fetchOne: fetchOneCustomers,
  createOne: createCustomers,
  updateOne: updateCustomers,
  deleteOne: deleteCustomers,
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
