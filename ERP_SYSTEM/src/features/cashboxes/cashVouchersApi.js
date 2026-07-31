// features/cashboxes/cashVouchersApi.js
import { baseApi } from "../../lib/baseApi"; // عدّل المسار لو مختلف

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashVouchers: builder.query({
      query: ({
        cashboxId,
        fromDate,
        toDate,
        pageNumber = 1,
        pageSize = 20,
      }) => ({
        url: "/CashVouchers",
        params: {
          CashboxId: cashboxId,
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "CashVoucher", id: `LIST-${arg.cashboxId}` },
      ],
    }),

    getCashVoucherById: builder.query({
      query: (id) => `/CashVouchers/${id}`,
      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    createCashVoucher: builder.mutation({
      query: (body) => ({ url: "/CashVouchers", method: "POST", body }),
      invalidatesTags: (result, error, arg) => [
        { type: "CashVoucher", id: `LIST-${arg.cashboxId}` },
      ],
    }),

    // ⚠️ لسه محتاج تأكيد إن الـ endpoint ده موجود فعلاً عندك (مكنش في اللستة اللي بعتها الأول)
    updateCashVoucher: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/CashVouchers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CashVoucher", id: `LIST-${arg.cashboxId}` },
        { type: "CashVoucher", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetCashVouchersQuery,
  useGetCashVoucherByIdQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
} = cashVouchersApi;
