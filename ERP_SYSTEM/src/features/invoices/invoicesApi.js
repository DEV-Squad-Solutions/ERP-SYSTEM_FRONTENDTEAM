import { baseApi } from "../../lib/baseApi";

const MOVEMENT_TYPE_TO_INVOICE_TYPE = {
  sale: "Sales",
  purchase: "Purchase",
  sale_return: "SalesReturn",
  purchase_return: "PurchaseReturn",
};

function buildInvoiceParams({
  movementType,
  invoiceNumber,
  partyId,
  storeId,
  driverId,
  paymentMethod,
  status,
  country,
  itemsCategoryId,
  currency,
  fromDate,
  toDate,
} = {}) {
  return {
    invoiceType: MOVEMENT_TYPE_TO_INVOICE_TYPE[movementType] || undefined,

    invoiceNumber: invoiceNumber || undefined,

    businessPartnerId: partyId || undefined,

    storeId: storeId || undefined,

    driverId: driverId || undefined,

    paymentTerm: paymentMethod || undefined,

    PriceStatus: status || undefined,

    CountryId: country || undefined,

    itemsCategoryId: itemsCategoryId || undefined,

    currency: currency || undefined,

    fromDate: fromDate || undefined,

    toDate: toDate || undefined,
  };
}

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // GET INVOICES
    // =========================================================

    getInvoices: builder.query({
      query: ({ page = 1, pageSize = 25, ...filters } = {}) => ({
        url: "Invoices",
        params: {
          PageNumber: page,
          PageSize: pageSize,
          ...buildInvoiceParams(filters),
        },
      }),

      providesTags: (result, error, arg) => {
        const movementType = arg?.movementType;

        const invoiceType = MOVEMENT_TYPE_TO_INVOICE_TYPE[movementType];

        if (invoiceType === "Purchase") {
          return [
            { type: "Purchase", id: "LIST" },
            { type: "Invoice", id: "LIST" },
          ];
        }

        if (invoiceType === "Sales") {
          return [
            { type: "Sale", id: "LIST" },
            { type: "Invoice", id: "LIST" },
          ];
        }

        return [
          { type: "Invoice", id: "LIST" },
          { type: "Sale", id: "LIST" },
          { type: "Purchase", id: "LIST" },
        ];
      },
    }),

    // =========================================================
    // GET INVOICES FOR SUMMARY / EXPORT
    // =========================================================

    getInvoicesForSummary: builder.query({
      query: (filters = {}) => ({
        url: "Invoices",
        params: {
          PageNumber: 1,
          PageSize: 100,
          ...buildInvoiceParams(filters),
        },
      }),

      providesTags: [
        { type: "Invoice", id: "LIST" },
        { type: "Sale", id: "LIST" },
        { type: "Purchase", id: "LIST" },
      ],
    }),

    // =========================================================
    // GET INVOICE BY ID
    // =========================================================

    getInvoiceById: builder.query({
      query: (id) => ({
        url: `Invoices/${id}`,
      }),

      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    // =========================================================
    // CREATE
    // =========================================================

    createInvoice: builder.mutation({
      query: (data) => ({
        url: "Invoices",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        { type: "Invoice", id: "LIST" },
        { type: "Sale", id: "LIST" },
        { type: "Purchase", id: "LIST" },

        "Inventory",
        "Cashbox",
        "CashVoucher",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // =========================================================
    // UPDATE
    // =========================================================

    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Invoices/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        { type: "Invoice", id: "LIST" },

        { type: "Sale", id: "LIST" },
        { type: "Purchase", id: "LIST" },

        "Inventory",
        "Cashbox",
        "CashVoucher",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // =========================================================
    // DELETE
    // =========================================================

    deleteInvoice: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `Invoices/${id}`,
        method: "DELETE",

        params: {
          rowVersion,
        },
      }),

      invalidatesTags: (result, error, { id }) => [
        // الفاتورة نفسها
        { type: "Invoice", id },
        { type: "Invoice", id: "LIST" },

        // صفحات المبيعات والمشتريات
        { type: "Sale", id: "LIST" },
        { type: "Purchase", id: "LIST" },

        // التأثيرات الجانبية
        "Inventory",
        "Cashbox",
        "CashVoucher",
        "Party",
        "PartyStatement",
        "Statement",
        "Driver",
        "DriverStatement",
        "DriverTripCost",
      ],
    }),

    // =========================================================
    // ITEM BALANCE
    // =========================================================

    getItemBalance: builder.query({
      query: ({ storeId, itemId, asOfDate, invoiceId }) => ({
        url: "Invoices/item-balance",
        params: {
          storeId,
          itemId,
          asOfDate,
          invoiceId,
        },
      }),
    }),

    // =========================================================
    // RETURN SOURCES
    // =========================================================

    getReturnSources: builder.query({
      query: ({
        businessPartnerId,
        storeId,
        returnType,
        asOfDate,
        search,
        currentReturnInvoiceId,
        pageNumber = 1,
        pageSize = 20,
      }) => ({
        url: "Invoices/return-sources",

        params: {
          BusinessPartnerId: businessPartnerId,
          StoreId: storeId,
          ReturnType: returnType,
          AsOfDate: asOfDate,
          Search: search || undefined,
          CurrentReturnInvoiceId: currentReturnInvoiceId || undefined,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      }),

      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoicesForSummaryQuery,
  useGetInvoiceByIdQuery,

  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  useGetItemBalanceQuery,
  useGetReturnSourcesQuery,
} = invoicesApi;
