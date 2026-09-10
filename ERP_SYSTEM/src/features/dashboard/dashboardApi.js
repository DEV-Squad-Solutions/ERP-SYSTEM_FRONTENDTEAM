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
      // "Dashboard" اتضافت لـ tagTypes. ملحوظة: الداشبورد بتتأثر عمليًا
      // بكل حاجة (فواتير/سندات/رواتب...) لكن مفيش داعي تعمل invalidate
      // ليها من كل موديول - أفضل حل إنها تعمل polling خفيف
      // (pollingInterval في الـ component) أو تتوصل بالـ realtimeSync
      // لو حابب تحديث فوري.
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useLazyGetDashboardSummaryQuery } =
  dashboardApi;
