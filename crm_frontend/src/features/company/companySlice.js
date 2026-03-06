import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("company", "/company");

export const {
  fetchAll: fetchCompany,
  fetchOne: fetchOneCompany,
  createOne: createCompany,
  updateOne: updateCompany,
  deleteOne: deleteCompany,
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
