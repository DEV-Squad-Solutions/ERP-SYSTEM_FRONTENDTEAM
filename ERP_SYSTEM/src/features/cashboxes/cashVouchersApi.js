// features/cashboxes/cashVouchersApi.js
import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashVouchers: builder.query({
      query: ({
        cashboxId,
        fromDate,
        toDate,
        pageNumber = 1,
        pageSize = 100,
      }) => ({
        url: "/CashVouchers",
        method: "GET",
        params: {
          cashboxId,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          pageNumber,
          pageSize,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "CashVoucher", id: `LIST-${arg.cashboxId}` },
      ],
    }),

    getCashVoucherById: builder.query({
      query: (id) => ({ url: `/CashVouchers/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    createCashVoucher: builder.mutation({
      query: (body) => ({
        url: "/CashVouchers",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CashVoucher", id: `LIST-${arg.cashboxId}` },
        { type: "Cashbox", id: arg.cashboxId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCashVouchersQuery,
  useGetCashVoucherByIdQuery,
  useCreateCashVoucherMutation,
} = cashVouchersApi;
