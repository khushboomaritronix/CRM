import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("vendors", "/vendors");

export const {
  fetchAll: fetchVendors,
  fetchOne: fetchOneVendors,
  createOne: createVendors,
  updateOne: updateVendors,
  deleteOne: deleteVendors,
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
