import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("items", "/inventory/items");
export const { fetchAll: fetchItems, fetchOne: fetchOneItems, createOne: createItems, updateOne: updateItems, deleteOne: deleteItems } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
