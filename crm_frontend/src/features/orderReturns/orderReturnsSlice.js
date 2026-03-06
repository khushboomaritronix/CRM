import { createCRUDSlice } from "../crudSliceFactory";
const { actions, reducer, selectors } = createCRUDSlice("orderReturns", "/order-returns");
export const { fetchAll: fetchOrderReturns, fetchOne: fetchOneOrderReturns, createOne: createOrderReturns, updateOne: updateOrderReturns, deleteOne: deleteOrderReturns } = actions;
export const { selectList, selectSelected, selectLoading, selectSubmitting, selectError, selectPagination } = selectors;
export default reducer;
