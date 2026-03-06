import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("modules", "/modules");

export const {
  fetchAll: fetchModules,
  fetchOne: fetchOneModules,
  createOne: createModules,
  updateOne: updateModules,
  deleteOne: deleteModules,
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
