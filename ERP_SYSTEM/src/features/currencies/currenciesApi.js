// features/currencies/currenciesApi.js

import { baseApi } from "../../lib/baseApi";

export const currenciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Select — قائمة العملات المتاحة للاختيار
    // response: [{ value: "USD", description: "..." }]
    // =========================================================
    getCurrenciesSelect: builder.query({
      query: () => "Currencies/select",

      providesTags: ["CurrenciesSelect"],
    }),
  }),
});

export const { useGetCurrenciesSelectQuery } = currenciesApi;
