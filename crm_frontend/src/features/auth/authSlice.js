import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ─── Thunks ──────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login/", { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Login failed. Check your credentials."
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/users/me/");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      await api.post("/auth/users/logout/", { refresh: refreshToken });
    } catch {
      // ignore logout errors
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  permissions: JSON.parse(localStorage.getItem("permissions") || "{}"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token || payload.access;
      if (payload.refreshToken) state.refreshToken = payload.refreshToken;
      if (payload.user) state.user = payload.user;
      if (payload.permissions) state.permissions = payload.permissions;
      localStorage.setItem("access_token", state.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.permissions = {};
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("permissions");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.token = payload.access;
        state.refreshToken = payload.refresh;
        state.user = payload.user;
        state.permissions = payload.permissions || {};
        localStorage.setItem("access_token", payload.access);
        localStorage.setItem("refresh_token", payload.refresh);
        localStorage.setItem("permissions", JSON.stringify(payload.permissions || {}));
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // fetchMe
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload;
      })
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.permissions = {};
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("permissions");
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export const selectHasPermission = (moduleSlug, action) => (state) => {
  const user = state.auth.user;
  if (user?.is_superuser) return true;
  const modulePerms = state.auth.permissions?.[moduleSlug] || [];
  return modulePerms.includes(action);
};

export default authSlice.reducer;
