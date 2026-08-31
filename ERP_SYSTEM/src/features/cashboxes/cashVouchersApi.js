import { baseApi } from "../../lib/baseApi";

export const cashVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashVouchers: builder.query({
      query: ({ pageNumber = 1, pageSize = 20, ...filters } = {}) => ({
        url: "CashVouchers",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Search: filters.search || undefined,
          VoucherNumber: filters.voucherNumber || undefined,
          Direction: filters.direction || undefined,
          CashboxId:
            filters.cashboxId !== "" &&
            filters.cashboxId !== null &&
            filters.cashboxId !== undefined
              ? Number(filters.cashboxId)
              : undefined,
          CashMovementTypeId:
            filters.cashMovementTypeId !== "" &&
            filters.cashMovementTypeId !== null &&
            filters.cashMovementTypeId !== undefined
              ? Number(filters.cashMovementTypeId)
              : undefined,
          Classification: filters.classification || undefined,
          PartyType: filters.partyType || undefined,
          EmployeeId:
            filters.employeeId !== "" &&
            filters.employeeId !== null &&
            filters.employeeId !== undefined
              ? Number(filters.employeeId)
              : undefined,
          BusinessPartnerId:
            filters.businessPartnerId !== "" &&
            filters.businessPartnerId !== null &&
            filters.businessPartnerId !== undefined
              ? Number(filters.businessPartnerId)
              : undefined,
          DriverId:
            filters.driverId !== "" &&
            filters.driverId !== null &&
            filters.driverId !== undefined
              ? Number(filters.driverId)
              : undefined,
          DriverTripId:
            filters.driverTripId !== "" &&
            filters.driverTripId !== null &&
            filters.driverTripId !== undefined
              ? Number(filters.driverTripId)
              : undefined,
          IsDraft:
            filters.isDraft === "true"
              ? true
              : filters.isDraft === "false"
                ? false
                : undefined,
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

    getCashVoucherById: builder.query({
      query: (id) => `CashVouchers/${id}`,
      providesTags: (result, error, id) => [{ type: "CashVoucher", id }],
    }),

    getCashVoucherPartySelect: builder.query({
      query: () => "CashVouchers/party-select",
      providesTags: ["CashVoucherPartySelect"],
    }),

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
  useGetCashVoucherPartySelectQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
  useDeleteCashVoucherMutation,
} = cashVouchersApi;
