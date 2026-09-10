import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => ({ url: "Employees/GetAll", params }),
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
      query: (data) => ({ url: "Employees", method: "POST", body: data }),
      // موظف جديد لازم يظهر فورًا في: قائمة الموظفين + party-select
      // بتاع سند القبض/الصرف + كشف حساب الموظفين. tagsFor("Employee")
      // بتغطيهم الثلاثة من مكان واحد.
      invalidatesTags: tagsFor("Employee"),
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `Employees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagsFor("Employee"),
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({ url: `Employees/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Employee"),
    }),

    getEmployeeAttendances: builder.query({
      query: (params) => ({ url: "EmployeeAttendances", params }),
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
      invalidatesTags: tagsFor("Attendance"),
    }),

    updateEmployeeAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `EmployeeAttendances/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    bulkCreateEmployeeAttendances: builder.mutation({
      query: (data) => ({
        url: "EmployeeAttendances/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    deleteEmployeeAttendance: builder.mutation({
      query: (id) => ({ url: `EmployeeAttendances/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    bulkDeleteEmployeeAttendances: builder.mutation({
      query: (attendanceIds) => ({
        url: "/EmployeeAttendances/bulk/delete",
        method: "POST",
        body: { attendanceIds },
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    // ============================================================
    // Employee Movements (بديل EmployeeTransactions القديمة)
    // ============================================================
    getEmployeeMovements: builder.query({
      query: (params) => ({ url: "EmployeeMovements", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((movement) => ({
                type: "EmployeeMovement",
                id: movement.id,
              })),
              { type: "EmployeeMovement", id: "LIST" },
            ]
          : [{ type: "EmployeeMovement", id: "LIST" }],
    }),

    getEmployeeMovementById: builder.query({
      query: (id) => `EmployeeMovements/${id}`,
      providesTags: (result, error, id) => [{ type: "EmployeeMovement", id }],
    }),

    createEmployeeMovement: builder.mutation({
      query: (data) => ({
        url: "EmployeeMovements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("EmployeeMovement"),
    }),

    bulkCreateEmployeeMovements: builder.mutation({
      query: (data) => ({
        url: "EmployeeMovements/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("EmployeeMovement"),
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
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    moveSalary: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `PayrollEntries/${id}/move-salary`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    bulkMoveSalary: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk/move-salary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    recalculatePayrollEntry: builder.mutation({
      query: (id) => ({
        url: `PayrollEntries/${id}/recalculate`,
        method: "POST",
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    getPayrollEntries: builder.query({
      query: (params) => ({ url: "PayrollEntries", params }),
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
      query: (data) => ({ url: "PayrollEntries", method: "POST", body: data }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    payPayrollEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `PayrollEntries/${id}/pay`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    deletePayrollEntry: builder.mutation({
      query: (id) => ({ url: `PayrollEntries/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    bulkDeletePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk/delete",
        method: "POST",
        body: { payrollEntryIds: data.payrollEntryIds.map(Number) },
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
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
      invalidatesTags: tagsFor("EmployeeOpeningBalance"),
    }),

    updateEmployeeOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/EmployeeOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("EmployeeOpeningBalance"),
    }),

    deleteEmployeeOpeningBalance: builder.mutation({
      query: (id) => ({
        url: `/EmployeeOpeningBalances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("EmployeeOpeningBalance"),
    }),

    getPayrollDashboard: builder.query({
      query: (params) => ({
        url: "PayrollEntries/dashboard",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "PayrollEntry", id: "DASHBOARD" }],
    }),

    getPayrollReport: builder.query({
      query: ({ StartDate, EndDate }) => ({
        url: "PayrollEntries/report",
        method: "GET",
        params: { StartDate, EndDate },
      }),
      providesTags: [{ type: "PayrollEntry", id: "REPORT" }],
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
  useGetEmployeeMovementsQuery,
  useGetEmployeeMovementByIdQuery,
  useCreateEmployeeMovementMutation,
  useBulkCreateEmployeeMovementsMutation,
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
  useGetPayrollDashboardQuery,
  useGetPayrollReportQuery,
} = payrollApi;
