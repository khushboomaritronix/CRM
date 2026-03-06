import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("debitNotes", "/debit-notes");
export const { fetchAll: fetchDebitNotes, fetchOne: fetchOneDebitNotes, createOne: createDebitNotes, updateOne: updateDebitNotes, deleteOne: deleteDebitNotes } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
