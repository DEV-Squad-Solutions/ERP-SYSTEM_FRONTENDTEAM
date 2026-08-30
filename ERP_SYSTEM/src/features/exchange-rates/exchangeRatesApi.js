import { baseApi } from "../../lib/baseApi";

export const exchangeRatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeRates: builder.query({
      query: ({ pageNumber = 1, pageSize = 50, ...filters } = {}) => ({
        url: "ExchangeRates",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Currency: filters.currency || undefined,
          FromDate: filters.fromDate || undefined,
          ToDate: filters.toDate || undefined,
        },
      }),
      providesTags: (result) => [
        { type: "ExchangeRate", id: "LIST" },
        ...(result?.items || []).map((r) => ({
          type: "ExchangeRate",
          id: r.id,
        })),
      ],
    }),

    getExchangeRateById: builder.query({
      query: (id) => `ExchangeRates/${id}`,
      providesTags: (result, error, id) => [{ type: "ExchangeRate", id }],
    }),

    resolveExchangeRate: builder.query({
      query: ({ currency, date }) => ({
        url: "ExchangeRates/resolve",
        params: {
          currency,
          date,
        },
      }),
    }),

    createExchangeRate: builder.mutation({
      query: (data) => ({
        url: "ExchangeRates",
        method: "POST",
        body: {
          currency: data.currency,
          rate: Number(data.rate),
          rateDate: data.rateDate,
          source: data.source || "Manual",
          notes: data.notes?.trim() || undefined,
        },
      }),
      invalidatesTags: [{ type: "ExchangeRate", id: "LIST" }],
    }),

    updateExchangeRate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `ExchangeRates/${id}`,
        method: "PUT",
        body: {
          currency: data.currency,
          rate: Number(data.rate),
          rateDate: data.rateDate,
          source: data.source,
          provider: data.provider,
          notes: data.notes?.trim() || undefined,
          rowVersion: data.rowVersion,
          updateLinkedTransactions: !!data.updateLinkedTransactions,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ExchangeRate", id },
        { type: "ExchangeRate", id: "LIST" },
        "CashVoucher",
        "Statement",
        "Cashbox",
      ],
    }),

    deleteExchangeRate: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `ExchangeRates/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ExchangeRate", id },
        { type: "ExchangeRate", id: "LIST" },
      ],
    }),

    previewImportExchangeRates: builder.mutation({
      query: (data) => ({
        url: "ExchangeRates/import/preview",
        method: "POST",
        body: {
          rateDate: data.rateDate,
          currencies: data.currencies?.length ? data.currencies : [],
          replaceUnreferencedImportedRates:
            !!data.replaceUnreferencedImportedRates,
        },
      }),
    }),

    importExchangeRates: builder.mutation({
      query: (data) => ({
        url: "ExchangeRates/import",
        method: "POST",
        body: {
          rateDate: data.rateDate,
          currencies: data.currencies?.length ? data.currencies : [],
          replaceUnreferencedImportedRates:
            !!data.replaceUnreferencedImportedRates,
        },
      }),
      invalidatesTags: [{ type: "ExchangeRate", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExchangeRatesQuery,
  useGetExchangeRateByIdQuery,
  useLazyResolveExchangeRateQuery,
  useCreateExchangeRateMutation,
  useUpdateExchangeRateMutation,
  useDeleteExchangeRateMutation,
  usePreviewImportExchangeRatesMutation,
  useImportExchangeRatesMutation,
} = exchangeRatesApi;
