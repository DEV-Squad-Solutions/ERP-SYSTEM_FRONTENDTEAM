import { baseApi } from "../../lib/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: ({ fromDate, toDate } = {}) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("FromDate", fromDate);
        if (toDate) params.append("ToDate", toDate);
        const qs = params.toString();
        return `/Dashboard${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useLazyGetDashboardSummaryQuery } =
  dashboardApi;
