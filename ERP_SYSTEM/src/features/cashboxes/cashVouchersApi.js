import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toOptionalNumber = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const buildVoucherBody = (data, { includeRowVersion = false } = {}) => {
  const body = {
    voucherDate: data.voucherDate,
    direction: data.direction,
    cashboxId: toNullableNumber(data.cashboxId),
    cashMovementTypeId: toNullableNumber(data.cashMovementTypeId),
    employeeId: toNullableNumber(data.employeeId),
    businessPartnerId: toNullableNumber(data.businessPartnerId),
    driverId: toNullableNumber(data.driverId),
    driverTripId: toNullableNumber(data.driverTripId),
    externalPartyName: data.externalPartyName?.trim() || undefined,
    amount: Number(data.amount),
    referenceNumber: data.referenceNumber?.trim() || undefined,
    description: data.description?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    accountId: toNullableNumber(data.accountId),
    exchangeRate: toOptionalNumber(data.exchangeRate),
  };

  if (data.classification !== undefined) {
    body.classification = data.classification;
  }

  if (includeRowVersion) {
    body.rowVersion = data.rowVersion;
  }

  return body;
};

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
            filters.cashboxId !== "" && filters.cashboxId != null
              ? Number(filters.cashboxId)
              : undefined,
          CashMovementTypeId:
            filters.cashMovementTypeId !== "" &&
            filters.cashMovementTypeId != null
              ? Number(filters.cashMovementTypeId)
              : undefined,
          Classification: filters.classification || undefined,
          PartyType: filters.partyType || undefined,
          EmployeeId:
            filters.employeeId !== "" && filters.employeeId != null
              ? Number(filters.employeeId)
              : undefined,
          BusinessPartnerId:
            filters.businessPartnerId !== "" &&
            filters.businessPartnerId != null
              ? Number(filters.businessPartnerId)
              : undefined,
          DriverId:
            filters.driverId !== "" && filters.driverId != null
              ? Number(filters.driverId)
              : undefined,
          DriverTripId:
            filters.driverTripId !== "" && filters.driverTripId != null
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
      // دي كانت مش بتتعمل لها invalidate من أي مكان - أي موظف/عميل/سائق/
      // نوع مصروف جديد ما كانش بيظهر في القائمة دي غير بعد refresh يدوي.
      // دلوقتي resourceTagsMap بيعمل invalidate لـ CashVoucherPartySelect
      // من Party / Driver / Employee / CashMovementType تلقائيًا.
      providesTags: ["CashVoucherPartySelect"],
    }),

    createCashVoucher: builder.mutation({
      query: (data) => ({
        url: "CashVouchers",
        method: "POST",
        body: buildVoucherBody(data),
      }),
      invalidatesTags: tagsFor("CashVoucher"),
    }),

    updateCashVoucher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `CashVouchers/${id}`,
        method: "PUT",
        body: buildVoucherBody(data, { includeRowVersion: true }),
      }),
      invalidatesTags: tagsFor("CashVoucher"),
    }),

    deleteCashVoucher: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `CashVouchers/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),
      invalidatesTags: tagsFor("CashVoucher"),
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
