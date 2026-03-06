import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("roles", "/roles");

export const {
  fetchAll: fetchRoles,
  fetchOne: fetchOneRoles,
  createOne: createRoles,
  updateOne: updateRoles,
  deleteOne: deleteRoles,
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
