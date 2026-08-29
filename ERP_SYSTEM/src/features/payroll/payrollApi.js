import { baseApi } from "../../lib/baseApi";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
                id: employee.id,
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
        url: "Employees",
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

    bulkCreateEmployeeAttendances: builder.mutation({
      query: (data) => ({
        url: "EmployeeAttendances/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
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
    bulkDeleteEmployeeAttendances: builder.mutation({
      query: (attendanceIds) => ({
        url: "/EmployeeAttendances/bulk/delete",
        method: "POST",
        body: { attendanceIds },
      }),
      invalidatesTags: ["Attendance"], // عدّل الـ tag على حسب المستخدم في باقي attendance endpoints
    }),

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

    bulkCreatePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk",
        method: "POST",
        body: {
          entries: data.entries.map((e) => ({
            employeeId: Number(e.employeeId),
            startDate: e.startDate,
            endDate: e.endDate,
            bonus: Number(e.bonus) || 0,
            deduction: Number(e.deduction) || 0,
            isSalaryMoveToEmployeeAccount: !!e.isSalaryMoveToEmployeeAccount,
            cashboxId: e.cashboxId ? Number(e.cashboxId) : undefined,
            cashMovementTypeId: e.cashMovementTypeId
              ? Number(e.cashMovementTypeId)
              : undefined,
          })),
          defaultStartDate: data.defaultStartDate || undefined,
          defaultEndDate: data.defaultEndDate || undefined,
          defaultIsSalaryMoveToEmployeeAccount:
            data.defaultIsSalaryMoveToEmployeeAccount ?? undefined,
          defaultCashboxId: data.defaultCashboxId
            ? Number(data.defaultCashboxId)
            : undefined,
          defaultCashMovementTypeId: data.defaultCashMovementTypeId
            ? Number(data.defaultCashMovementTypeId)
            : undefined,
        },
      }),
      invalidatesTags: [
        { type: "PayrollEntry", id: "LIST" },
        "Cashbox",
        "Statement",
      ],
    }),

    moveSalary: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `PayrollEntries/${id}/move-salary`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
        "Cashbox",
        "Statement",
      ],
    }),

    bulkMoveSalary: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk/move-salary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "PayrollEntry", id: "LIST" },
        "Cashbox",
        "Statement",
      ],
    }),

    recalculatePayrollEntry: builder.mutation({
      query: (id) => ({
        url: `PayrollEntries/${id}/recalculate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),

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

    createPayrollEntry: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "PayrollEntry", id: "LIST" }],
    }),

    payPayrollEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `PayrollEntries/${id}/pay`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),

    deletePayrollEntry: builder.mutation({
      query: (id) => ({
        url: `PayrollEntries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PayrollEntry", id },
        { type: "PayrollEntry", id: "LIST" },
      ],
    }),

    bulkDeletePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk/delete",
        method: "POST",
        body: {
          payrollEntryIds: data.payrollEntryIds.map(Number),
        },
      }),
      invalidatesTags: [
        { type: "PayrollEntry", id: "LIST" },
        "Cashbox",
        "Statement",
      ],
    }),
    getEmployeeOpeningBalances: builder.query({
      query: (params) => ({
        url: "/EmployeeOpeningBalances",
        method: "GET",
        params,
      }),
      providesTags: ["EmployeeOpeningBalance"],
    }),

    createEmployeeOpeningBalance: builder.mutation({
      query: (body) => ({
        url: "/EmployeeOpeningBalances",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmployeeOpeningBalance"],
    }),

    // عدّل الاسم/المسار لو عندك update/delete فعليين في الـ swagger
    updateEmployeeOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/EmployeeOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["EmployeeOpeningBalance"],
    }),

    deleteEmployeeOpeningBalance: builder.mutation({
      query: (id) => ({
        url: `/EmployeeOpeningBalances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeOpeningBalance"],
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
  useBulkCreateEmployeeAttendancesMutation,
  useDeleteEmployeeAttendanceMutation,
  useBulkDeleteEmployeeAttendancesMutation,

  useGetEmployeeTransactionsQuery,
  useCreateEmployeeTransactionMutation,
  useUpdateEmployeeTransactionMutation,
  useDeleteEmployeeTransactionMutation,
  useGetPayrollEntriesQuery,
  useGetPayrollEntryByIdQuery,
  useCreatePayrollEntryMutation,
  usePayPayrollEntryMutation,
  useDeletePayrollEntryMutation,
  useBulkCreatePayrollEntriesMutation,
  useMoveSalaryMutation,
  useBulkMoveSalaryMutation,
  useRecalculatePayrollEntryMutation,
  useBulkDeletePayrollEntriesMutation,
  useGetEmployeeOpeningBalancesQuery,
  useCreateEmployeeOpeningBalanceMutation,
  useUpdateEmployeeOpeningBalanceMutation,
  useDeleteEmployeeOpeningBalanceMutation,
} = payrollApi;
