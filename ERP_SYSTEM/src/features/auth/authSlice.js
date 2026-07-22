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

const initialState = {
  fullName: persisted?.fullName || null,
  email: persisted?.email || null,
  roles: persisted?.roles || [],
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
    fullName: state.fullName,
    email: state.email,
    roles: state.roles,
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
      state.fullName = data.fullName;
      state.email = data.email;
      state.roles = data.roles || [];
      state.selectionToken = data.selectionToken;
      state.companies = data.companies || [];
      state.requiresCompanySelection = data.requiresCompanySelection;

      if (!data.requiresCompanySelection) {
        state.accessToken = data.accessToken;
        state.refreshToken = data.refreshToken;
        state.isAuthenticated = true;
        const company = data.companies?.[0] || null;
        state.selectedCompany = company;
      }

      persistState(state);
    },

    setCompanySelection: (state, action) => {
      const data = action.payload;

      state.accessToken = data.accessToken;
      state.refreshToken = data.refreshToken;
      state.requiresCompanySelection = false;
      state.isAuthenticated = true;

      // نحدد الشركة المختارة من الـ companies اللي كانت متخزنة قبل الاختيار
      const company =
        state.companies.find((c) => c.id === data.selectedCompanyId) ||
        data.companies?.[0] ||
        null;
      state.selectedCompany = company;

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

    logout: (state) => {
      localStorage.removeItem(STORAGE_KEY);

      state.fullName = null;
      state.email = null;
      state.roles = [];
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

export const { setCredentials, setCompanySelection, updateTokens, logout } =
  authSlice.actions;
export default authSlice.reducer;
