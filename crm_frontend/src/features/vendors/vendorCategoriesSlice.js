import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("vendorCategories", "/vendors/categories");
export const { fetchAll: fetchVendorCategories, fetchOne: fetchOneVendorCategories, createOne: createVendorCategories, updateOne: updateVendorCategories, deleteOne: deleteVendorCategories } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
