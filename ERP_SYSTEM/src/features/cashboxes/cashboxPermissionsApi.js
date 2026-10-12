import { baseApi } from "../../lib/baseApi";

/**
 * صلاحيات خزائن المستخدم (per user + company + cashbox).
 *
 * - GET  /CashboxPermissions/current
 *   نطاق المستخدم الحالي في الشركة المختارة:
 *   { hasAllCashboxes, viewCashboxIds, executeCashboxIds }
 *
 * - GET  /Users/{userId}/cashbox-permissions  (Admin فقط)
 *   { userId, companyId, allCashboxes, revision, permissions: [
 *       { cashboxId, canView, canExecute } ] }
 *
 * - PUT  /Users/{userId}/cashbox-permissions  (Admin فقط)
 *   يستبدل المجموعة بالكامل: { allCashboxes, revision, permissions }
 *   لازم نرسل آخر revision ناتج من GET، وإلا 409.
 *
 * الصلاحيات مش مرتبطة بالسنة المالية. تغيير الشركة بيصفّر كاش الـ API
 * (resetApiState) فالنطاق بيتحمّل من جديد تلقائيًا.
 */
export const cashboxPermissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentCashboxPermissions: builder.query({
      query: () => ({ url: "CashboxPermissions/current", method: "GET" }),
      providesTags: [{ type: "CashboxPermission", id: "CURRENT" }],
    }),

    getUserCashboxPermissions: builder.query({
      query: (userId) => ({
        url: `Users/${userId}/cashbox-permissions`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "CashboxPermission", id: userId },
      ],
    }),

    replaceUserCashboxPermissions: builder.mutation({
      query: ({ userId, allCashboxes, revision, permissions }) => ({
        url: `Users/${userId}/cashbox-permissions`,
        method: "PUT",
        body: { allCashboxes, revision, permissions },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "CashboxPermission", id: userId },
        // نطاق المستخدم الحالي ممكن يكون هو نفسه المستخدم المعدّل
        { type: "CashboxPermission", id: "CURRENT" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentCashboxPermissionsQuery,
  useGetUserCashboxPermissionsQuery,
  useReplaceUserCashboxPermissionsMutation,
} = cashboxPermissionsApi;
