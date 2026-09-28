import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../lib/baseApi";
import authReducer from "../features/auth/authSlice";
import fiscalYearReducer from "../features/fiscalYears/fiscalYearSlice";
import { fiscalYearMiddleware } from "../lib/fiscalYearMiddleware";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    fiscalYear: fiscalYearReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(fiscalYearMiddleware),
});
