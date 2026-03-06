import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("payments", "/payments");
export const { fetchAll: fetchPayments, fetchOne: fetchOnePayments, createOne: createPayments, updateOne: updatePayments, deleteOne: deletePayments } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
