import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("permissions", "/permissions");

export const {
  fetchAll: fetchPermissions,
  fetchOne: fetchOnePermissions,
  createOne: createPermissions,
  updateOne: updatePermissions,
  deleteOne: deletePermissions,
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
