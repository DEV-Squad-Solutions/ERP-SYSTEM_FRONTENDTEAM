import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== List ====================

    getCashVouchers: builder.query({
      query: ({ pageNumber = 1, pageSize = 20, ...filters } = {}) => ({
        url: "CashVouchers",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,

          Search: filters.search || undefined,
          VoucherNumber: filters.voucherNumber || undefined,
          Direction: filters.direction || undefined,
          CashboxId: filters.cashboxId || undefined,
          CashMovementTypeId: filters.cashMovementTypeId || undefined,
          PartyType: filters.partyType || undefined,
          BusinessPartnerId: filters.businessPartnerId || undefined,
          DriverId: filters.driverId || undefined,
          DriverTripId: filters.driverTripId || undefined,
          IsDraft: filters.isDraft ?? undefined,
          FromDate: filters.fromDate || undefined,
          ToDate: filters.toDate || undefined,
        },
      }),

      providesTags: (result) => [
        { type: "CashVoucher", id: "LIST" },

        ...(result?.items || []).map((voucher) => ({
          type: "CashVoucher",
          id: voucher.id,
        })),
      ],
    }),

    // ==================== Details ====================

    getCashVoucherById: builder.query({
      query: (id) => `CashVouchers/${id}`,

      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    // ==================== Create ====================

    createCashVoucher: builder.mutation({
      query: (data) => ({
        url: "CashVouchers",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        { type: "CashVoucher", id: "LIST" },
        "Cashbox",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // ==================== Update ====================

    updateCashVoucher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `CashVouchers/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "CashVoucher", id },
        { type: "CashVoucher", id: "LIST" },

        "Cashbox",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // ==================== Delete ====================

    deleteCashVoucher: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `CashVouchers/${id}`,
        method: "DELETE",
        params: {
          rowVersion,
        },
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "CashVoucher", id },
        { type: "CashVoucher", id: "LIST" },

        "Cashbox",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),
  }),
});

export const {
  useGetCashVouchersQuery,
  useGetCashVoucherByIdQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
  useDeleteCashVoucherMutation,
} = cashVouchersApi;
