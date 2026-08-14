// features/payroll/payrollApi.js
//
// مبني على نفس Pattern الموجود في driversApi.js، مع إضافة mock switch:
// لو USE_MOCKS (في payroll.mocks.js) = true، كل endpoint بيرجع من الـin-memory
// mock store بدل ما ينادي الـbackend الحقيقي. غيّر القيمة هناك بس للتبديل.

import { baseApi } from "../../lib/baseApi";
import {
  USE_MOCKS,
  mockDelay,
  mockGetEmployees,
  mockGetEmployeeById,
  mockGetEmployeesSelect,
  mockCreateEmployee,
  mockUpdateEmployee,
  mockDeleteEmployee,
  mockGetEmployeeAttendances,
  mockCreateEmployeeAttendance,
  mockUpdateEmployeeAttendance,
  mockDeleteEmployeeAttendance,
  mockGetEmployeeTransactions,
  mockCreateEmployeeTransaction,
  mockUpdateEmployeeTransaction,
  mockDeleteEmployeeTransaction,
  mockGetPayrollEntries,
  mockGetPayrollEntryById,
  mockGeneratePayrollEntries,
  mockApprovePayrollEntry,
  mockDisbursePayrollEntry,
} from "./payroll.mocks";

// helper بيلف أي mock function عشان يرجع بنفس شكل { data } / { error } اللي
// RTK Query متوقعه من queryFn، ومحاكي delay بسيط زي شبكة حقيقية.
async function withMock(fn) {
  await mockDelay();
  try {
    return { data: fn() };
  } catch (error) {
    return { error: { status: 400, data: { message: error.message } } };
  }
}

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============ Employees ============
    getEmployees: builder.query({
      queryFn: async (params, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGetEmployees(params));
        return baseQuery({ url: "Employees", params });
      },
      providesTags: (result) =>
        result?.employees
          ? [
              ...result.employees.map((e) => ({
                type: "Employee",
                id: e.code,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGetEmployeeById(id));
        return baseQuery(`Employees/${id}`);
      },
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    // TODO INTEGRATION: تأكيد المسار، مستنتج من نمط Drivers/select
    getEmployeesSelect: builder.query({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGetEmployeesSelect());
        return baseQuery("Employees/select");
      },
      providesTags: ["Employee"],
    }),

    createEmployee: builder.mutation({
      queryFn: async (data, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockCreateEmployee(data));
        return baseQuery({ url: "Employees", method: "POST", body: data });
      },
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation({
      queryFn: async ({ id, ...data }, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockUpdateEmployee(id, data));
        return baseQuery({ url: `Employees/${id}`, method: "PUT", body: data });
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    deleteEmployee: builder.mutation({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockDeleteEmployee(id));
        return baseQuery({ url: `Employees/${id}`, method: "DELETE" });
      },
      invalidatesTags: (result, error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    // ============ Attendance ============
    getEmployeeAttendances: builder.query({
      queryFn: async (params, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockGetEmployeeAttendances(params));
        return baseQuery({ url: "EmployeeAttendances", params });
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((a) => ({ type: "Attendance", id: a.id })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    createEmployeeAttendance: builder.mutation({
      queryFn: async (data, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockCreateEmployeeAttendance(data));
        return baseQuery({
          url: "EmployeeAttendances",
          method: "POST",
          body: data,
        });
      },
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    updateEmployeeAttendance: builder.mutation({
      queryFn: async ({ id, ...data }, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockUpdateEmployeeAttendance(id, data));
        return baseQuery({
          url: `EmployeeAttendances/${id}`,
          method: "PUT",
          body: data,
        });
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
      ],
    }),

    deleteEmployeeAttendance: builder.mutation({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockDeleteEmployeeAttendance(id));
        return baseQuery({
          url: `EmployeeAttendances/${id}`,
          method: "DELETE",
        });
      },
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // ============ Transactions ============
    getEmployeeTransactions: builder.query({
      queryFn: async (params, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockGetEmployeeTransactions(params));
        return baseQuery({ url: "EmployeeTransactions", params });
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((t) => ({ type: "Transaction", id: t.id })),
              { type: "Transaction", id: "LIST" },
            ]
          : [{ type: "Transaction", id: "LIST" }],
    }),

    createEmployeeTransaction: builder.mutation({
      queryFn: async (data, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockCreateEmployeeTransaction(data));
        return baseQuery({
          url: "EmployeeTransactions",
          method: "POST",
          body: data,
        });
      },
      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),

    updateEmployeeTransaction: builder.mutation({
      queryFn: async ({ id, ...data }, _api, _extra, baseQuery) => {
        if (USE_MOCKS)
          return withMock(() => mockUpdateEmployeeTransaction(id, data));
        return baseQuery({
          url: `EmployeeTransactions/${id}`,
          method: "PUT",
          body: data,
        });
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Transaction", id },
        { type: "Transaction", id: "LIST" },
      ],
    }),

    deleteEmployeeTransaction: builder.mutation({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockDeleteEmployeeTransaction(id));
        return baseQuery({
          url: `EmployeeTransactions/${id}`,
          method: "DELETE",
        });
      },
      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),

    // ============ Payroll Entries ============
    getPayrollEntries: builder.query({
      queryFn: async (params, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGetPayrollEntries(params));
        return baseQuery({ url: "PayrollEntries", params });
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "PayrollEntry", id: p.id })),
              { type: "PayrollEntry", id: "LIST" },
            ]
          : [{ type: "PayrollEntry", id: "LIST" }],
    }),

    getPayrollEntryById: builder.query({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGetPayrollEntryById(id));
        return baseQuery(`PayrollEntries/${id}`);
      },
      providesTags: (result, error, id) => [{ type: "PayrollEntry", id }],
    }),

    generatePayrollEntries: builder.mutation({
      queryFn: async (data, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockGeneratePayrollEntries(data));
        return baseQuery({
          url: "PayrollEntries/generate",
          method: "POST",
          body: data,
        });
      },
      invalidatesTags: [{ type: "PayrollEntry", id: "LIST" }],
    }),

    approvePayrollEntry: builder.mutation({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockApprovePayrollEntry(id));
        return baseQuery({
          url: `PayrollEntries/${id}/approve`,
          method: "PATCH",
        });
      },
      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),

    disbursePayrollEntry: builder.mutation({
      queryFn: async (id, _api, _extra, baseQuery) => {
        if (USE_MOCKS) return withMock(() => mockDisbursePayrollEntry(id));
        return baseQuery({
          url: `PayrollEntries/${id}/disburse`,
          method: "PATCH",
        });
      },
      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeesSelectQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,

  useGetEmployeeAttendancesQuery,
  useCreateEmployeeAttendanceMutation,
  useUpdateEmployeeAttendanceMutation,
  useDeleteEmployeeAttendanceMutation,

  useGetEmployeeTransactionsQuery,
  useCreateEmployeeTransactionMutation,
  useUpdateEmployeeTransactionMutation,
  useDeleteEmployeeTransactionMutation,

  useGetPayrollEntriesQuery,
  useGetPayrollEntryByIdQuery,
  useGeneratePayrollEntriesMutation,
  useApprovePayrollEntryMutation,
  useDisbursePayrollEntryMutation,
} = payrollApi;
