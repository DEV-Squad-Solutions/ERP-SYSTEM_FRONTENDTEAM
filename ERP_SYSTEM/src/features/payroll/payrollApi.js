import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

let mockPayroll = [
  {
    id: "1",
    code: "EMP-101",
    employeeName: "أحمد محمد علي",
    workStartDate: "2026-07-01",
    workEndDate: "2026-07-31",
    basicSalary: 8000,
    overtime: 1500, // إضافي
    bonuses: 500,   // مكافآت
    advances: 1000, // سلف
    penalties: 200, // جزاءات/غياب
    notes: "تم صرف راتب يوليو",
  },
  {
    id: "2",
    code: "EMP-102",
    employeeName: "محمود إبراهيم",
    workStartDate: "2026-07-01",
    workEndDate: "2026-07-31",
    basicSalary: 7500,
    overtime: 800,
    bonuses: 0,
    advances: 1500,
    penalties: 300,
    notes: "خصم قسط سلفة",
  },
];

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayroll: builder.query({
      queryFn: async (filters = {}, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({ url: "Payroll", params: filters });
        }

        let result = mockPayroll.map((item) => {
          const totalEarned = (item.basicSalary || 0) + (item.overtime || 0) + (item.bonuses || 0);
          const totalDeductions = (item.advances || 0) + (item.penalties || 0);
          const netSalary = totalEarned - totalDeductions;

          return {
            ...item,
            totalEarned,
            totalDeductions,
            netSalary,
          };
        });

        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (p) =>
              p.employeeName.toLowerCase().includes(q) ||
              p.code.toLowerCase().includes(q)
          );
        }

        if (filters.fromDate) {
          result = result.filter((p) => new Date(p.workStartDate) >= new Date(filters.fromDate));
        }

        if (filters.toDate) {
          result = result.filter((p) => new Date(p.workEndDate) <= new Date(filters.toDate));
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