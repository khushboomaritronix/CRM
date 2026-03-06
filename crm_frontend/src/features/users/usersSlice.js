import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("users", "/auth/users");

export const {
  fetchAll: fetchUsers,
  fetchOne: fetchOneUsers,
  createOne: createUsers,
  updateOne: updateUsers,
  deleteOne: deleteUsers,
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
