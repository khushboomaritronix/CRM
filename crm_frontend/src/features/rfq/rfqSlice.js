import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("rfq", "/rfq");

export const {
  fetchAll: fetchRfq,
  fetchOne: fetchOneRfq,
  createOne: createRfq,
  updateOne: updateRfq,
  deleteOne: deleteRfq,
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
