import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("estimates", "/estimates");

export const {
  fetchAll: fetchEstimates,
  fetchOne: fetchOneEstimates,
  createOne: createEstimates,
  updateOne: updateEstimates,
  deleteOne: deleteEstimates,
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
