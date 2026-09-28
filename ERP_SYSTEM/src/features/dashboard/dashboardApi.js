import { baseApi } from "../../lib/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      // fiscalYearId جزء من الـ args => جزء من الـ cache key، فتغيير السنة من
      // الـ Topbar بيعمل fetch جديد بدل ما يرجّع بيانات السنة القديمة.
      // بنبعته في params object (مش في الـ URL string) عشان baseQuery
      // يعرف إنه متحدد صراحةً ومايضيفوش تاني.
      query: ({ fromDate, toDate, fiscalYearId } = {}) => ({
        url: "/Dashboard",
        params: {
          ...(fiscalYearId ? { fiscalYearId } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      }),
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
