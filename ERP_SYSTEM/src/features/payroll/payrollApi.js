import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

let mockPayroll = [
  {
    id: "1",
    code: "EMP-101",
    employeeName: "أحمد محمد علي",
    workStartDate: "2026-07-01",
    workEndDate: "2026-07-28",
    debit: 12000,
    credit: 1500,
    balance: 10500,
    notes: "راتب شهر يوليو + مكافأة",
  },
  {
    id: "2",
    code: "EMP-102",
    employeeName: "محمود إبراهيم",
    workStartDate: "2026-07-01",
    workEndDate: "2026-07-28",
    debit: 9500,
    credit: 2000,
    balance: 7500,
    notes: "خصم سلفة سابقة",
  },
];

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayroll: builder.query({
      queryFn: async (filters = {}, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({ url: "Payroll", params: filters });
        }

        let result = [...mockPayroll];

        // فلترة بالاسم أو الكود
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (p) =>
              p.employeeName.toLowerCase().includes(q) ||
              p.code.toLowerCase().includes(q)
          );
        }

        // فلترة بالتاريخ من
        if (filters.fromDate) {
          result = result.filter(
            (p) => new Date(p.workStartDate) >= new Date(filters.fromDate)
          );
        }

        // فلترة بالتاريخ إلى
        if (filters.toDate) {
          result = result.filter(
            (p) => new Date(p.workEndDate) <= new Date(filters.toDate)
          );
        }

        // فلترة بالحالة (مدين / دائن)
        if (filters.status === "debit") {
          result = result.filter((p) => p.debit > 0);
        } else if (filters.status === "credit") {
          result = result.filter((p) => p.credit > 0);
        }

        return { data: await mockDelay(result) };
      },
      providesTags: ["Payroll"],
    }),

    deletePayrollRecord: builder.mutation({
      queryFn: async (id, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({ url: `Payroll/${id}`, method: "DELETE" });
        }

        mockPayroll = mockPayroll.filter((item) => String(item.id) !== String(id));
        await mockDelay(null, 300);
        return { data: { id } };
      },
      invalidatesTags: ["Payroll"],
    }),
  }),
});

export const { useGetPayrollQuery, useDeletePayrollRecordMutation } = payrollApi;