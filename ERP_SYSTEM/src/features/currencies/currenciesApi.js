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
      // "CurrenciesSelect" مكانتش متسجلة في tagTypes خالص - اتضافت في
      // baseApi.js الجديد. من غير كده كان بيدي console warning وممكن
      // الـ invalidation ميشتغلش صح مع نسخ RTK Query الأحدث.
      providesTags: ["CurrenciesSelect"],
    }),
  }),
});

export const { useGetCurrenciesSelectQuery } = currenciesApi;
