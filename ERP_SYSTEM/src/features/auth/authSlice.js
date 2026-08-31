import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "auth";

const loadPersistedAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persisted = loadPersistedAuth();

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

const initialState = {
  userId: persisted?.userId || null,
  fullName: persisted?.fullName || null,
  email: persisted?.email || null,
  roles: normalizeArray(persisted?.roles),
  permissions: normalizeArray(persisted?.permissions),
  accessToken: persisted?.accessToken || null,
  refreshToken: persisted?.refreshToken || null,
  selectionToken: persisted?.selectionToken || null,
  companies: persisted?.companies || [],
  selectedCompany: persisted?.selectedCompany || null,
  requiresCompanySelection: persisted?.requiresCompanySelection || false,
  isAuthenticated: !!persisted?.accessToken,
};

const persistState = (state) => {
  const toStore = {
    userId: state.userId,
    fullName: state.fullName,
    email: state.email,
    roles: state.roles,
    permissions: state.permissions,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    selectionToken: state.selectionToken,
    companies: state.companies,
    selectedCompany: state.selectedCompany,
    requiresCompanySelection: state.requiresCompanySelection,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const data = action.payload;
      const user = data.user || data;

      state.userId = user.id || user.userId || data.id || data.userId || null;
      state.fullName =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        null;
      state.email = user.email || data.email || null;
      state.roles = normalizeArray(user.roles || data.roles);
      state.permissions = normalizeArray(user.permissions || data.permissions);
      state.selectionToken = data.selectionToken || null;
      state.companies = data.companies || user.companies || [];
      state.requiresCompanySelection = !!data.requiresCompanySelection;

      if (!data.requiresCompanySelection) {
        state.accessToken = data.accessToken || null;
        state.refreshToken = data.refreshToken || null;
        state.isAuthenticated = !!data.accessToken;
        state.selectedCompany =
          data.companies?.[0] || user.companies?.[0] || null;
      }

      persistState(state);
    },

    setCompanySelection: (state, action) => {
      const data = action.payload;

      state.accessToken = data.accessToken || null;
      state.refreshToken = data.refreshToken || null;
      state.requiresCompanySelection = false;
      state.isAuthenticated = !!data.accessToken;

      if (data.id || data.userId) {
        state.userId = data.id || data.userId;
      }

      if (Array.isArray(data.roles)) {
        state.roles = normalizeArray(data.roles);
      }

      if (Array.isArray(data.permissions)) {
        state.permissions = normalizeArray(data.permissions);
      }

      const company =
        state.companies.find(
          (company) => company.id === data.selectedCompanyId,
        ) ||
        data.companies?.[0] ||
        state.selectedCompany ||
        null;

      state.selectedCompany = company;

      if (Array.isArray(data.companies)) {
        state.companies = data.companies;
      }

      persistState(state);
    },

    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      state.isAuthenticated = true;

      persistState(state);
    },

    setPermissions: (state, action) => {
      state.permissions = normalizeArray(action.payload);
      persistState(state);
    },

    setRoles: (state, action) => {
      state.roles = normalizeArray(action.payload);
      persistState(state);
    },

    logout: (state) => {
      localStorage.removeItem(STORAGE_KEY);

      state.userId = null;
      state.fullName = null;
      state.email = null;
      state.roles = [];
      state.permissions = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.selectionToken = null;
      state.companies = [];
      state.selectedCompany = null;
      state.requiresCompanySelection = false;
      state.isAuthenticated = false;
    },
  },
});

export const selectUserId = (state) => state.auth.userId;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectSelectedCompany = (state) => state.auth.selectedCompany;
export const selectRoles = (state) => state.auth.roles || [];
export const selectPermissions = (state) => state.auth.permissions || [];

export const selectIsAdmin = (state) =>
  selectRoles(state).some((role) => String(role).toLowerCase() === "admin");

export const {
  setCredentials,
  setCompanySelection,
  updateTokens,
  setPermissions,
  setRoles,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
