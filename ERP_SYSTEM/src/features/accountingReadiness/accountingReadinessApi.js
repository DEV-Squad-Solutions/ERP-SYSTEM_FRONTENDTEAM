import { baseApi } from "../../lib/baseApi";

export const accountingReadinessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountingReadiness: builder.query({
      query: (fiscalYearId) => ({
        url: "/AccountingReadiness",
        params: { fiscalYearId },
      }),
      providesTags: (result, error, fiscalYearId) => [
        { type: "AccountingReadiness", id: fiscalYearId },
      ],
    }),

    backfillAccountingReadiness: builder.mutation({
      query: (fiscalYearId) => ({
        url: "/AccountingReadiness/backfill",
        method: "POST",
        params: { fiscalYearId },
      }),
      invalidatesTags: (result, error, fiscalYearId) => [
        { type: "AccountingReadiness", id: fiscalYearId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountingReadinessQuery,
  useLazyGetAccountingReadinessQuery,
  useBackfillAccountingReadinessMutation,
} = accountingReadinessApi;
