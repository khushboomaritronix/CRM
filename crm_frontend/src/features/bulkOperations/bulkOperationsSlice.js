import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("bulkOperations", "/bulk");

export const {
  fetchAll: fetchBulkOperations,
  fetchOne: fetchOneBulkOperations,
  createOne: createBulkOperations,
  updateOne: updateBulkOperations,
  deleteOne: deleteBulkOperations,
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
