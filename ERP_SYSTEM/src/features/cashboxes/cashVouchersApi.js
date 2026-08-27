import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // List
    // =========================================================
    getCashVouchers: builder.query({
      query: ({ pageNumber = 1, pageSize = 20, ...filters } = {}) => ({
        url: "CashVouchers",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Search: filters.search || undefined,
          VoucherNumber: filters.voucherNumber || undefined,
          Direction: filters.direction || undefined,
          Classification: filters.classification || undefined,
          CashboxId: filters.cashboxId || undefined,
          CashMovementTypeId: filters.cashMovementTypeId || undefined,
          PartyType: filters.partyType || undefined,
          BusinessPartnerId: filters.businessPartnerId || undefined,
          DriverId: filters.driverId || undefined,
          DriverTripId: filters.driverTripId || undefined,
          EmployeeId: filters.employeeId || undefined,
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

    // =========================================================
    // Details
    // =========================================================
    getCashVoucherById: builder.query({
      query: (id) => `CashVouchers/${id}`,

      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    // =========================================================
    // Party / description select
    // =========================================================
    getCashVoucherPartySelect: builder.query({
      query: () => `CashVouchers/party-select`,

      providesTags: ["CashVoucherPartySelect"],
    }),

    // =========================================================
    // Create
    //
    // اتظبط عشان يبعت نفس حقول الـ update (ماعدا id/rowVersion)
    // من غيرهم مش هيتسجل نوع الحركة ولا الجهة ولا التصنيف.
    // =========================================================
    createCashVoucher: builder.mutation({
      query: (data) => ({
        url: "CashVouchers",
        method: "POST",
        body: {
          voucherDate: data.voucherDate,
          direction: data.direction,
          classification: data.classification,

          cashboxId: Number(data.cashboxId),

          cashMovementTypeId:
            data.cashMovementTypeId != null && data.cashMovementTypeId !== ""
              ? Number(data.cashMovementTypeId)
              : null,

          businessPartnerId:
            data.businessPartnerId != null && data.businessPartnerId !== ""
              ? Number(data.businessPartnerId)
              : null,

          driverId:
            data.driverId != null && data.driverId !== ""
              ? Number(data.driverId)
              : null,

          driverTripId:
            data.driverTripId != null && data.driverTripId !== ""
              ? Number(data.driverTripId)
              : undefined,

          employeeId:
            data.employeeId != null && data.employeeId !== ""
              ? Number(data.employeeId)
              : null,

          externalPartyName: data.externalPartyName?.trim() || undefined,

          amount: Number(data.amount),

          referenceNumber: data.referenceNumber?.trim() || undefined,
          description: data.description?.trim() || undefined,
          notes: data.notes?.trim() || undefined,

          exchangeRate:
            data.exchangeRate != null && data.exchangeRate !== ""
              ? Number(data.exchangeRate)
              : undefined,
        },
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

    // =========================================================
    // Update
    // =========================================================
    updateCashVoucher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `CashVouchers/${id}`,
        method: "PUT",
        body: {
          voucherDate: data.voucherDate,
          direction: data.direction,
          classification: data.classification,

          cashboxId: Number(data.cashboxId),

          cashMovementTypeId:
            data.cashMovementTypeId != null && data.cashMovementTypeId !== ""
              ? Number(data.cashMovementTypeId)
              : null,

          businessPartnerId:
            data.businessPartnerId != null && data.businessPartnerId !== ""
              ? Number(data.businessPartnerId)
              : null,

          driverId:
            data.driverId != null && data.driverId !== ""
              ? Number(data.driverId)
              : null,

          driverTripId:
            data.driverTripId != null && data.driverTripId !== ""
              ? Number(data.driverTripId)
              : undefined,

          employeeId:
            data.employeeId != null && data.employeeId !== ""
              ? Number(data.employeeId)
              : null,

          externalPartyName: data.externalPartyName?.trim() || undefined,

          amount: Number(data.amount),

          referenceNumber: data.referenceNumber?.trim() || undefined,
          description: data.description?.trim() || undefined,
          notes: data.notes?.trim() || undefined,

          // مهم جدًا: لا يتم تعديل أو تحويل rowVersion
          rowVersion: data.rowVersion,

          exchangeRate:
            data.exchangeRate != null && data.exchangeRate !== ""
              ? Number(data.exchangeRate)
              : undefined,
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

    // =========================================================
    // Delete
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
  useGetCashVoucherPartySelectQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
  useDeleteCashVoucherMutation,
} = cashVouchersApi;
