import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("customerGroups", "/customers/groups");
export const { fetchAll: fetchCustomerGroups, fetchOne: fetchOneCustomerGroups, createOne: createCustomerGroups, updateOne: updateCustomerGroups, deleteOne: deleteCustomerGroups } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
