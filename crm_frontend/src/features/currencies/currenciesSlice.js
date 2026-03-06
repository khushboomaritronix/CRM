import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("currencies", "/currencies");
export const { fetchAll: fetchCurrencies, fetchOne: fetchOneCurrencies, createOne: createCurrencies, updateOne: updateCurrencies, deleteOne: deleteCurrencies } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
