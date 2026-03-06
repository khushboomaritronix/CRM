import { createCRUDSlice } from "../crudSliceFactory";

const { slice, actions, reducer, selectors } = createCRUDSlice("pdfTemplates", "/pdf-templates");

export const {
  fetchAll: fetchPdfTemplates,
  fetchOne: fetchOnePdfTemplates,
  createOne: createPdfTemplates,
  updateOne: updatePdfTemplates,
  deleteOne: deletePdfTemplates,
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
