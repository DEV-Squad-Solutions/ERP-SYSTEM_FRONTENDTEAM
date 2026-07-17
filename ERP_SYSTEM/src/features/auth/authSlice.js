import { createSlice } from "@reduxjs/toolkit";

const savedAuth = JSON.parse(localStorage.getItem("auth")) || null;

const initialState = {
  selectedCompany: savedAuth?.selectedCompany || null, // { id, name } - الشركة المختارة قبل اللوجن
  user: savedAuth?.user || null,
  token: savedAuth?.token || null,
  isAuthenticated: !!savedAuth?.token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload; // { id, name }
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem(
        "auth",
        JSON.stringify({ user, token, selectedCompany: state.selectedCompany }),
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedCompany = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setSelectedCompany, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
