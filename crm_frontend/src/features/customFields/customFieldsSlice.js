import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("customFields", "/custom-fields");

export const {
  fetchAll: fetchCustomFields,
  fetchOne: fetchOneCustomFields,
  createOne: createCustomFields,
  updateOne: updateCustomFields,
  deleteOne: deleteCustomFields,
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
