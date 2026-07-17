import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api", // اسم الـ slice في الـ store

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

    prepareHeaders: (headers, { getState }) => {
      // ناخد التوكن من الـ Redux state (auth slice) مش من localStorage مباشرة
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // كل الـ tags اللي هتستخدمها كل الموديولات، بنجمعها هنا في مكان واحد
  tagTypes: [
    "Company",
    "User",
    "Customer",
    "Supplier",
    "Bank",
    "Inventory",
    "JournalEntry",
    "Treasury",
    "Purchase",

    "Expense",
    "Asset",
    "Purchase",
    "Sale",
  ],
  // فاضي هنا عن قصد - كل feature هيعمل injectEndpoints عليه بدل ما نكتب كل حاجة هنا
  endpoints: () => ({}),
});
