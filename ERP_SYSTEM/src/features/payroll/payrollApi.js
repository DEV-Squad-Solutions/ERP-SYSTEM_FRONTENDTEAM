import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

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
      query: (params) => ({
        url: "Employees/select",
        params,
      }),
      providesTags: [{ type: "Employee", id: "LIST" }],
    }),

    getOutCompanyEmployees: builder.query({
      query: (params = {}) => ({
        url: "Employees/GetAll",
        params: {
          PageNumber: params.PageNumber || 1,
          PageSize: params.PageSize || 1000,
          Search: params.Search || undefined,
          WorkPlaceStatus: "OutCompany",
          IsActive: params.IsActive ?? true,
        },
      }),
      providesTags: (result) =>
        result?.employees
          ? [
              ...result.employees.map((employee) => ({
                type: "Employee",
                id: employee.id,
              })),
              {
                type: "Employee",
                id: "OUT_COMPANY_LIST",
              },
            ]
          : [
              {
                type: "Employee",
                id: "OUT_COMPANY_LIST",
              },
            ],
    }),

    createEmployee: builder.mutation({
      query: (data) => ({
        url: "Employees",
        method: "POST",
        body: data,
      }),
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
      query: (id) => ({
        url: `Employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("Employee"),
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
              {
                type: "Attendance",
                id: "LIST",
              },
            ]
          : [
              {
                type: "Attendance",
                id: "LIST",
              },
            ],
    }),
    getEmployeeAttendancesSelect: builder.query({
      query: () => ({
        url: "EmployeeAttendances/select",
        method: "GET",
      }),
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
        body: {
          attendances: (data?.attendances || []).map((attendance) => ({
            employeeId: Number(attendance.employeeId),

            status:
              attendance.status === "Present" ||
              attendance.status === 1 ||
              attendance.status === "1"
                ? 1
                : 0,

            workDate: attendance.workDate,

            checkIn: attendance.checkIn || null,

            checkOut: attendance.checkOut || null,

            workDayRatio:
              attendance.workDayRatio == null
                ? null
                : Number(attendance.workDayRatio),

            workOverTimeRatio:
              attendance.workOverTimeRatio == null
                ? null
                : Number(attendance.workOverTimeRatio),

            workDaysDeductionRatio:
              attendance.workDaysDeductionRatio == null
                ? null
                : Number(attendance.workDaysDeductionRatio),

            workLocation: attendance.workLocation || null,

            notes: attendance.notes || null,
          })),
        },
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    bulkUpdateEmployeeAttendances: builder.mutation({
      query: (data) => ({
        url: "EmployeeAttendances/bulk",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    deleteEmployeeAttendance: builder.mutation({
      query: (id) => ({
        url: `EmployeeAttendances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    bulkDeleteEmployeeAttendances: builder.mutation({
      query: (attendanceIds) => ({
        url: "EmployeeAttendances/bulk",
        method: "DELETE",
        body: {
          attendanceIds: attendanceIds.map(Number),
        },
      }),
      invalidatesTags: tagsFor("Attendance"),
    }),

    getEmployeeMovements: builder.query({
      query: (params) => ({
        url: "EmployeeMovements",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((movement) => ({
                type: "EmployeeMovement",
                id: movement.id,
              })),
              {
                type: "EmployeeMovement",
                id: "LIST",
              },
            ]
          : [
              {
                type: "EmployeeMovement",
                id: "LIST",
              },
            ],
    }),

    getEmployeeMovementById: builder.query({
      query: (id) => `EmployeeMovements/${id}`,
      providesTags: (result, error, id) => [
        {
          type: "EmployeeMovement",
          id,
        },
      ],
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

    createOutCompanyPayrollEntry: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/out-company",
        method: "POST",
        body: {
          employeeId: Number(data.employeeId),
          startDate: data.startDate,
          endDate: data.endDate,
          presentDays: Number(data.presentDays) || 0,
          workedDaysByDayUnit: Number(data.workedDaysByDayUnit) || 0,
          overtimeByDayUnit: Number(data.overtimeByDayUnit) || 0,
          deductionByDayUnit: Number(data.deductionByDayUnit) || 0,
          bonus: Number(data.bonus) || 0,
          deduction: Number(data.deduction) || 0,
        },
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    bulkCreateOutCompanyPayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/out-company/bulk",
        method: "POST",
        body: {
          entries: (data.entries || []).map((entry) => ({
            employeeId: Number(entry.employeeId),
            presentDays: Number(entry.presentDays) || 0,
            workedDaysByDayUnit: Number(entry.workedDaysByDayUnit) || 0,
            startDate: entry.startDate,
            endDate: entry.endDate,
            overtimeByDayUnit: Number(entry.overtimeByDayUnit) || 0,
            deductionByDayUnit: Number(entry.deductionByDayUnit) || 0,
            bonus: Number(entry.bonus) || 0,
            deduction: Number(entry.deduction) || 0,
          })),
          defaultStartDate: data.defaultStartDate || undefined,
          defaultEndDate: data.defaultEndDate || undefined,
        },
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    updateOutCompanyPayrollEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `PayrollEntries/out-company/${id}`,
        method: "PUT",
        body: {
          startDate: data.startDate,
          endDate: data.endDate,
          presentDays: Number(data.presentDays) || 0,
          workedDaysByDayUnit: Number(data.workedDaysByDayUnit) || 0,
          overtimeByDayUnit: Number(data.overtimeByDayUnit) || 0,
          deductionByDayUnit: Number(data.deductionByDayUnit) || 0,
          bonus: Number(data.bonus) || 0,
          deduction: Number(data.deduction) || 0,
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
              {
                type: "PayrollEntry",
                id: "LIST",
              },
            ]
          : [
              {
                type: "PayrollEntry",
                id: "LIST",
              },
            ],
    }),

    getPayrollEntryById: builder.query({
      query: (id) => `PayrollEntries/${id}`,
      providesTags: (result, error, id) => [
        {
          type: "PayrollEntry",
          id,
        },
      ],
    }),

    createPayrollEntry: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries",
        method: "POST",
        body: data,
      }),
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
      query: (id) => ({
        url: `PayrollEntries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("PayrollEntry"),
    }),

    bulkDeletePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/bulk",
        method: "DELETE",
        body: {
          payrollEntryIds: data.payrollEntryIds.map(Number),
        },
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
      providesTags: [
        {
          type: "PayrollEntry",
          id: "DASHBOARD",
        },
      ],
    }),

    getPayrollReport: builder.query({
      query: ({ StartDate, EndDate }) => ({
        url: "PayrollEntries/report",
        method: "GET",
        params: {
          StartDate,
          EndDate,
        },
      }),
      providesTags: [
        {
          type: "PayrollEntry",
          id: "REPORT",
        },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeesSelectQuery,
  useGetOutCompanyEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeeAttendancesQuery,
  useCreateEmployeeAttendanceMutation,
  useUpdateEmployeeAttendanceMutation,
  useGetEmployeeAttendancesSelectQuery,
  useBulkCreateEmployeeAttendancesMutation,
  useBulkUpdateEmployeeAttendancesMutation,
  useDeleteEmployeeAttendanceMutation,
  useBulkDeleteEmployeeAttendancesMutation,
  useGetEmployeeMovementsQuery,
  useGetEmployeeMovementByIdQuery,
  useCreateEmployeeMovementMutation,
  useBulkCreateEmployeeMovementsMutation,
  useGetPayrollEntriesQuery,
  useGetPayrollEntryByIdQuery,
  useCreatePayrollEntryMutation,
  useCreateOutCompanyPayrollEntryMutation,
  useBulkCreateOutCompanyPayrollEntriesMutation,
  useUpdateOutCompanyPayrollEntryMutation,
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
