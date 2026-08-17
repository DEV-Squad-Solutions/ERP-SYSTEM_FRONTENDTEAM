// features/payroll/payrollApi.js

import { baseApi } from "../../lib/baseApi";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Employees
    // =========================================================

    getEmployees: builder.query({
      query: (params) => ({
        url: "Employees/GetAll",
        params,
      }),

      providesTags: (result) =>
        result?.employees
          ? [
              ...result.employees.map((employee) => ({
                type: "Employee",
                id: employee.id ?? employee.code,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query({
      query: (id) => `Employees/${id}`,

      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    getEmployeesSelect: builder.query({
      query: () => "Employees/select",

      providesTags: [{ type: "Employee", id: "LIST" }],
    }),

    createEmployee: builder.mutation({
      query: (data) => ({
        url: "Employees/Create",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `Employees/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `Employees/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    // =========================================================
    // Attendance
    // =========================================================

    getEmployeeAttendances: builder.query({
      query: (params) => ({
        url: "EmployeeAttendances",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((attendance) => ({
                type: "Attendance",
                id: attendance.id,
              })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    createEmployeeAttendance: builder.mutation({
      query: (data) => ({
        url: "EmployeeAttendances",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    updateEmployeeAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `EmployeeAttendances/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
      ],
    }),

    deleteEmployeeAttendance: builder.mutation({
      query: (id) => ({
        url: `EmployeeAttendances/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
      ],
    }),

    // =========================================================
    // Employee Transactions
    // =========================================================

    getEmployeeTransactions: builder.query({
      query: (params) => ({
        url: "EmployeeTransactions",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((transaction) => ({
                type: "Transaction",
                id: transaction.id,
              })),
              { type: "Transaction", id: "LIST" },
            ]
          : [{ type: "Transaction", id: "LIST" }],
    }),

    createEmployeeTransaction: builder.mutation({
      query: (data) => ({
        url: "EmployeeTransactions",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),

    updateEmployeeTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `EmployeeTransactions/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Transaction", id },
        { type: "Transaction", id: "LIST" },
      ],
    }),

    deleteEmployeeTransaction: builder.mutation({
      query: (id) => ({
        url: `EmployeeTransactions/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Transaction", id },
        { type: "Transaction", id: "LIST" },
      ],
    }),

    // =========================================================
    // Payroll Entries
    // =========================================================

    getPayrollEntries: builder.query({
      query: (params) => ({
        url: "PayrollEntries",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((entry) => ({
                type: "PayrollEntry",
                id: entry.id,
              })),
              { type: "PayrollEntry", id: "LIST" },
            ]
          : [{ type: "PayrollEntry", id: "LIST" }],
    }),

    getPayrollEntryById: builder.query({
      query: (id) => `PayrollEntries/${id}`,

      providesTags: (result, error, id) => [{ type: "PayrollEntry", id }],
    }),

    generatePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/generate",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [{ type: "PayrollEntry", id: "LIST" }],
    }),

    approvePayrollEntry: builder.mutation({
      query: (id) => ({
        url: `PayrollEntries/${id}/approve`,
        method: "PATCH",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),

    disbursePayrollEntry: builder.mutation({
      query: (id) => ({
        url: `PayrollEntries/${id}/disburse`,
        method: "PATCH",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // Employees
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeesSelectQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,

  // Attendance
  useGetEmployeeAttendancesQuery,
  useCreateEmployeeAttendanceMutation,
  useUpdateEmployeeAttendanceMutation,
  useDeleteEmployeeAttendanceMutation,

  // Transactions
  useGetEmployeeTransactionsQuery,
  useCreateEmployeeTransactionMutation,
  useUpdateEmployeeTransactionMutation,
  useDeleteEmployeeTransactionMutation,

  // Payroll
  useGetPayrollEntriesQuery,
  useGetPayrollEntryByIdQuery,
  useGeneratePayrollEntriesMutation,
  useApprovePayrollEntryMutation,
  useDisbursePayrollEntryMutation,
} = payrollApi;
