import { baseApi } from "../../lib/baseApi";

// =========================================================
// MOVEMENT TYPE → INVOICE TYPE
// =========================================================

const MOVEMENT_TYPE_TO_INVOICE_TYPE = {
  sale: "Sales",
  purchase: "Purchase",
  sale_return: "SalesReturn",
  purchase_return: "PurchaseReturn",
};

// =========================================================
// INVOICE TYPE → TAG
// =========================================================

const INVOICE_TYPE_TO_TAG = {
  Sales: "Sale",
  Purchase: "Purchase",
  SalesReturn: "SaleReturn",
  PurchaseReturn: "PurchaseReturn",
};

// =========================================================
// BUILD PARAMS
// =========================================================

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

// =========================================================
// GET INVOICE LIST TAGS
// =========================================================

function getInvoiceListTags(movementType) {
  const invoiceType = MOVEMENT_TYPE_TO_INVOICE_TYPE[movementType];

  const tags = [
    {
      type: "Invoice",
      id: "LIST",
    },
  ];

  const specificTag = INVOICE_TYPE_TO_TAG[invoiceType];

  if (specificTag) {
    tags.push({
      type: specificTag,
      id: "LIST",
    });

    return tags;
  }

  // No movement type filter
  tags.push(
    {
      type: "Sale",
      id: "LIST",
    },
    {
      type: "Purchase",
      id: "LIST",
    },
    {
      type: "SaleReturn",
      id: "LIST",
    },
    {
      type: "PurchaseReturn",
      id: "LIST",
    },
  );

  return tags;
}

// =========================================================
// INVOICE INVALIDATION
// =========================================================

const invoiceInvalidationTags = [
  // Invoice lists
  {
    type: "Invoice",
    id: "LIST",
  },

  {
    type: "Sale",
    id: "LIST",
  },

  {
    type: "Purchase",
    id: "LIST",
  },

  {
    type: "SaleReturn",
    id: "LIST",
  },

  {
    type: "PurchaseReturn",
    id: "LIST",
  },

  // Inventory
  "Inventory",

  // Cashbox
  "Cashbox",
  "CashVoucher",

  // Partners
  "Party",
  "PartyStatement",
  "Statement",

  // Drivers
  "Driver",
  "DriverStatement",
  "DriverTripCost",
];

// =========================================================
// API
// =========================================================

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // GET INVOICES
    // =====================================================

    getInvoices: builder.query({
      query: ({ page = 1, pageSize = 25, ...filters } = {}) => ({
        url: "Invoices",

        params: {
          PageNumber: page,
          PageSize: pageSize,

          ...buildInvoiceParams(filters),
        },
      }),

      providesTags: (result, error, arg) =>
        getInvoiceListTags(arg?.movementType),
    }),

    // =====================================================
    // SUMMARY / EXPORT
    // =====================================================

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
        {
          type: "Invoice",
          id: "LIST",
        },

        {
          type: "Sale",
          id: "LIST",
        },

        {
          type: "Purchase",
          id: "LIST",
        },

        {
          type: "SaleReturn",
          id: "LIST",
        },

        {
          type: "PurchaseReturn",
          id: "LIST",
        },
      ],
    }),

    // =====================================================
    // GET BY ID
    // =====================================================

    getInvoiceById: builder.query({
      query: (id) => ({
        url: `Invoices/${id}`,
      }),

      providesTags: (result, error, id) => [
        {
          type: "Invoice",
          id,
        },
      ],
    }),

    // =====================================================
    // CREATE
    // =====================================================

    createInvoice: builder.mutation({
      query: (data) => ({
        url: "Invoices",
        method: "POST",
        body: data,
      }),

      invalidatesTags: invoiceInvalidationTags,
    }),

    // =====================================================
    // UPDATE
    // =====================================================

    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Invoices/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Invoice",
          id,
        },

        ...invoiceInvalidationTags,
      ],
    }),

    // =====================================================
    // DELETE
    // =====================================================

    deleteInvoice: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `Invoices/${id}`,

        method: "DELETE",

        params: {
          rowVersion,
        },
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Invoice",
          id,
        },

        ...invoiceInvalidationTags,
      ],
    }),

    // =====================================================
    // ITEM BALANCE
    // =====================================================

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

      providesTags: ["Inventory"],
    }),

    // =====================================================
    // RETURN SOURCES
    // =====================================================

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

      providesTags: ["Invoice"],

      keepUnusedDataFor: 30,
    }),
  }),
});

// =========================================================
// HOOKS
// =========================================================

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
