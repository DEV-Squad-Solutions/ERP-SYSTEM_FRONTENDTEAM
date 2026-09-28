import { baseApi } from "../../lib/baseApi";
import {
  setCredentials,
  setCompanySelection,
  setCompanySwitch,
} from "./authSlice";
import { resetFiscalYear } from "../fiscalYears/fiscalYearSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setCredentials(data));
        } catch {}
      },
    }),

    selectCompany: builder.mutation({
      query: (body) => ({
        url: "/auth/select-company",
        method: "POST",
        body,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setCompanySelection({
              ...data,
              selectedCompanyId: arg.companyId,
            }),
          );
        } catch {}
      },
    }),

    /**
     * تغيير الشركة بدون تسجيل خروج (POST /Auth/switch-company).
     * بعد النجاح: استبدال التوكنز، مسح كل كاش الـ API القديم
     * (بيانات الشركة السابقة)، ومسح السنة المالية المختارة —
     * بالظبط الخطوات الموضّحة في دليل تكامل الشركات.
     */
    switchCompany: builder.mutation({
      query: (body) => ({
        url: "/auth/switch-company",
        method: "POST",
        body,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setCompanySwitch({ ...data, selectedCompanyId: arg.companyId }),
          );

          // مسح selectedFiscalYearId القديم؛ FiscalYearSwitcher هيعيد
          // تحميل /FiscalYears/select ويختار السنة الحالية للشركة الجديدة
          dispatch(resetFiscalYear());

          // مسح كل كاش RTK Query (بيانات الشركة السابقة بالكامل)
          dispatch(baseApi.util.resetApiState());
        } catch {}
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSelectCompanyMutation,
  useSwitchCompanyMutation,
} = authApi;
