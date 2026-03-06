import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("creditNotes", "/credit-notes");
export const { fetchAll: fetchCreditNotes, fetchOne: fetchOneCreditNotes, createOne: createCreditNotes, updateOne: updateCreditNotes, deleteOne: deleteCreditNotes } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
