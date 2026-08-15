// features/cashboxes/cashVouchersApi.js
import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashVouchers: builder.query({
      query: (params = {}) => ({
        url: "/CashVouchers",
        method: "GET",
        params,
      }),
      providesTags: ["CashVouchers"],
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
