import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // GET /CashVouchers
    // =========================================================
    getCashVouchers: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        cashboxId,
        Search,
        VoucherNumber,
        Direction,
        CashMovementTypeId,
        PartyType,
        BusinessPartnerId,
        DriverId,
        DriverTripId,
        IsDraft,
        FromDate,
        ToDate,
      } = {}) => ({
        url: "CashVouchers",
        method: "GET",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,

          ...(cashboxId && { CashboxId: cashboxId }),

          ...(Search?.trim() && { Search: Search.trim() }),

          ...(VoucherNumber?.trim() && { VoucherNumber: VoucherNumber.trim() }),

          ...(Direction && { Direction }),

          ...(CashMovementTypeId && { CashMovementTypeId }),

          ...(PartyType && { PartyType }),

          ...(BusinessPartnerId && { BusinessPartnerId }),

          ...(DriverId && { DriverId }),

          ...(DriverTripId && { DriverTripId }),

          ...(IsDraft !== undefined &&
            IsDraft !== null &&
            IsDraft !== "" && {
              IsDraft:
                typeof IsDraft === "string"
                  ? IsDraft === "true"
                  : Boolean(IsDraft),
            }),

          ...(FromDate && { FromDate }),

          ...(ToDate && { ToDate }),
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

    // =========================================================
    // GET /CashVouchers/{id}
    // =========================================================
    getCashVoucherById: builder.query({
      query: (id) => ({
        url: `CashVouchers/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    // =========================================================
    // POST /CashVouchers
    //
    // ينشئ Draft فقط: voucherDate, direction, cashboxId, amount, description
    // مفيش exchangeRate — السيرفر بيديها القيمة الافتراضية 1 تلقائيًا
    // =========================================================
    createCashVoucher: builder.mutation({
      query: ({ voucherDate, direction, cashboxId, amount, description }) => ({
        url: "CashVouchers",
        method: "POST",
        body: {
          voucherDate,
          direction,
          cashboxId,
          amount,
          ...(description?.trim() && {
            description: description.trim(),
          }),
        },
      }),

      invalidatesTags: [
        { type: "CashVoucher", id: "LIST" },
        { type: "Cashbox", id: "LIST" },
        { type: "Cashbox", id: "OPTIONS" },
        "Cashbox",
      ],
    }),

    // =========================================================
    // PUT /CashVouchers/{id}
    //
    // id في الـ URL فقط، مش في الـ body
    // =========================================================
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
        { type: "Cashbox", id: "LIST" },

        "Party",
        "PartyStatement",
        "Statement",

        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // =========================================================
    // DELETE /CashVouchers/{id}
    // =========================================================
    deleteCashVoucher: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `CashVouchers/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "CashVoucher", id },
        { type: "CashVoucher", id: "LIST" },

        "Cashbox",
        { type: "Cashbox", id: "LIST" },

        "Party",
        "PartyStatement",
        "Statement",

        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetCashVouchersQuery,
  useGetCashVoucherByIdQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
  useDeleteCashVoucherMutation,
} = cashVouchersApi;
