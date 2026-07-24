import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./baseQueryWithReauth";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Company",
    "User",
    "Partner",
    "Bank",
    "Company",
    "User",
    "Party",
    "Driver",
    "Item",
    "ItemUnit",
    "Store",
    "Sale",
    "JournalEntry",
    "Treasury",
    "Expense",
    "Asset",
    "Treasury",
    "Expense",
    "Asset",
    "Purchase",
    "Invoice",
    "InvoiceAuditLog",
    "InvoicePackaging",
    "PartyStatement",
  ],
  // فاضي هنا عن قصد - كل feature هيعمل injectEndpoints عليه بدل ما نكتب كل حاجة هنا
  endpoints: () => ({}),
});
