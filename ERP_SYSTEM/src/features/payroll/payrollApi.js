// features/payroll/payrollApi.js
//
// مبني على نفس Pattern الموجود في driversApi.js
// أسماء الـendpoints دي متوقعة (استنتاج) من شكل الـJSON اللي بعتها ومن نفس
// الـconvention المستخدم في Drivers ("Drivers", "Drivers/select"...).
// أي سطر عليه // TODO INTEGRATION يحتاج تأكيد من Swagger قبل ما تشتغل عليه فعليًا.

import { baseApi } from "../../lib/baseApi";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============ Employees ============
    getEmployees: builder.query({
      query: (params) => ({
        url: "Employees",
        params,
      }),
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
      query: (id) => `Employees/${id}`,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    // TODO INTEGRATION: تأكيد المسار، مستنتج من نمط Drivers/select
    getEmployeesSelect: builder.query({
      query: () => "Employees/select",
      providesTags: ["Employee"],
    }),

    createEmployee: builder.mutation({
      query: (data) => ({ url: "Employees", method: "POST", body: data }),
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
      query: (id) => ({ url: `Employees/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    // ============ Attendance ============
    getEmployeeAttendances: builder.query({
      query: (params) => ({
        url: "EmployeeAttendances",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((a) => ({ type: "Attendance", id: a.id })),
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
      query: (id) => ({ url: `EmployeeAttendances/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // ============ Transactions (Deductions / Advances / Overtime & Allowances) ============
    // TODO INTEGRATION: الـschema المبعوت فيه type: "Debit" | "Credit" بس.
    // الـSpec بيفرّق بين 4 مفاهيم مختلفة (سلف / خصومات / إضافي / بدلات).
    // لغاية ما نتأكد من الـbackend، الافتراض المؤقت:
    //   - Debit  = خصم من صافي المرتب (يغطي: خصومات + سلف)
    //   - Credit = إضافة لصافي المرتب (يغطي: إضافي + بدلات + مكافآت)
    // وبيتم التفرقة بينهم في الواجهة عن طريق فلترة إضافية (لسه محتاجة endpoint
    // أو حقل category من الباك إند). الصفحات الأربعة بتستخدم نفس الـendpoints
    // دول مع فلاتر مختلفة كنقطة بداية، وسهل نعدلها لما ياخد الحقل category قيمة حقيقية.
    getEmployeeTransactions: builder.query({
      query: (params) => ({
        url: "EmployeeTransactions",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((t) => ({ type: "Transaction", id: t.id })),
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
      query: (id) => ({ url: `EmployeeTransactions/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),

    // ============ Payroll Entries (المرتبات) ============
    getPayrollEntries: builder.query({
      query: (params) => ({
        url: "PayrollEntries",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "PayrollEntry", id: p.id })),
              { type: "PayrollEntry", id: "LIST" },
            ]
          : [{ type: "PayrollEntry", id: "LIST" }],
    }),

    getPayrollEntryById: builder.query({
      query: (id) => `PayrollEntries/${id}`,
      providesTags: (result, error, id) => [{ type: "PayrollEntry", id }],
    }),

    // TODO INTEGRATION: مسار توليد المرتبات لفترة معينة غير مؤكد
    generatePayrollEntries: builder.mutation({
      query: (data) => ({
        url: "PayrollEntries/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "PayrollEntry", id: "LIST" }],
    }),

    // TODO INTEGRATION: مسارات الاعتماد والصرف غير مؤكدة
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
