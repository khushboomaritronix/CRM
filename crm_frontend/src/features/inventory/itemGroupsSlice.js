import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("itemGroups", "/inventory/item-groups");
export const { fetchAll: fetchItemGroups, fetchOne: fetchOneItemGroups, createOne: createItemGroups, updateOne: updateItemGroups, deleteOne: deleteItemGroups } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
