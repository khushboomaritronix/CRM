import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { buildQueryString } from "../services/api";

/**
 * Creates a standardized Redux slice for any CRUD module.
 * @param {string} name - slice name (e.g. 'customers')
 * @param {string} endpoint - API endpoint (e.g. '/customers')
 */
export function createCRUDSlice(name, endpoint) {
  // ─── Thunks ──────────────────────────────────────────────────────────────
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const qs = buildQueryString(params);
        const { data } = await api.get(`${endpoint}/${qs}`);
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  const fetchOne = createAsyncThunk(
    `${name}/fetchOne`,
    async (id, { rejectWithValue }) => {
      try {
        const { data } = await api.get(`${endpoint}/${id}/`);
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  const createOne = createAsyncThunk(
    `${name}/create`,
    async (payload, { rejectWithValue }) => {
      try {
        const { data } = await api.post(`${endpoint}/`, payload);
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  const updateOne = createAsyncThunk(
    `${name}/update`,
    async ({ id, data: payload }, { rejectWithValue }) => {
      try {
        const { data } = await api.patch(`${endpoint}/${id}/`, payload);
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  const deleteOne = createAsyncThunk(
    `${name}/delete`,
    async (id, { rejectWithValue }) => {
      try {
        await api.delete(`${endpoint}/${id}/`);
        return id;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  // ─── Slice ────────────────────────────────────────────────────────────────
  const initialState = {
    list: [],
    selected: null,
    pagination: { count: 0, next: null, previous: null, total_pages: 1, current_page: 1 },
    loading: false,
    submitting: false,
    error: null,
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearSelected: (state) => { state.selected = null; },
      clearError: (state) => { state.error = null; },
      setSelected: (state, { payload }) => { state.selected = payload; },
    },
    extraReducers: (builder) => {
      builder
        // fetchAll
        .addCase(fetchAll.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchAll.fulfilled, (state, { payload }) => {
          state.loading = false;
          if (Array.isArray(payload)) {
            state.list = payload;
          } else {
            state.list = payload.results || [];
            state.pagination = {
              count: payload.count,
              next: payload.next,
              previous: payload.previous,
              total_pages: payload.total_pages,
              current_page: payload.current_page,
            };
          }
        })
        .addCase(fetchAll.rejected, (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        })
        // fetchOne
        .addCase(fetchOne.pending, (state) => { state.loading = true; })
        .addCase(fetchOne.fulfilled, (state, { payload }) => {
          state.loading = false;
          state.selected = payload;
        })
        .addCase(fetchOne.rejected, (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        })
        // create
        .addCase(createOne.pending, (state) => { state.submitting = true; })
        .addCase(createOne.fulfilled, (state, { payload }) => {
          state.submitting = false;
          state.list.unshift(payload);
          state.pagination.count += 1;
        })
        .addCase(createOne.rejected, (state, { payload }) => {
          state.submitting = false;
          state.error = payload;
        })
        // update
        .addCase(updateOne.pending, (state) => { state.submitting = true; })
        .addCase(updateOne.fulfilled, (state, { payload }) => {
          state.submitting = false;
          const idx = state.list.findIndex((item) => item.id === payload.id);
          if (idx !== -1) state.list[idx] = payload;
          if (state.selected?.id === payload.id) state.selected = payload;
        })
        .addCase(updateOne.rejected, (state, { payload }) => {
          state.submitting = false;
          state.error = payload;
        })
        // delete
        .addCase(deleteOne.pending, (state) => { state.submitting = true; })
        .addCase(deleteOne.fulfilled, (state, { payload: id }) => {
          state.submitting = false;
          state.list = state.list.filter((item) => item.id !== id);
          state.pagination.count = Math.max(0, state.pagination.count - 1);
        })
        .addCase(deleteOne.rejected, (state, { payload }) => {
          state.submitting = false;
          state.error = payload;
        });
    },
  });

  return {
    slice,
    actions: { fetchAll, fetchOne, createOne, updateOne, deleteOne, ...slice.actions },
    reducer: slice.reducer,
    selectors: {
      selectList: (state) => state[name].list,
      selectSelected: (state) => state[name].selected,
      selectLoading: (state) => state[name].loading,
      selectSubmitting: (state) => state[name].submitting,
      selectError: (state) => state[name].error,
      selectPagination: (state) => state[name].pagination,
    },
  };
}
