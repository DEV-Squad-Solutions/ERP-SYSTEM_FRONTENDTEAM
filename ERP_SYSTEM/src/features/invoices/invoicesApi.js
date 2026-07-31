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
}) {
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
    getInvoices: builder.query({
      query: ({ page = 1, pageSize = 25, ...filters } = {}) => ({
        url: "Invoices",
        params: {
          PageNumber: page,
          PageSize: pageSize,
          ...buildInvoiceParams(filters),
        },
      }),
      providesTags: (result, error, arg) => [
        arg?.movementType === "purchase" ? "Purchase" : "Sale",
      ],
    }),

    getInvoicesForSummary: builder.query({
      query: (filters = {}) => ({
        url: "Invoices",
        params: {
          PageNumber: 1,
          PageSize: 100,
          ...buildInvoiceParams(filters),
        },
      }),
      providesTags: (result, error, arg) => [
        arg?.movementType === "purchase" ? "Purchase" : "Sale",
      ],
    }),

    getInvoiceById: builder.query({
      query: (id) => ({ url: `Invoices/${id}` }),
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    createInvoice: builder.mutation({
      query: (data) => ({ url: "Invoices", method: "POST", body: data }),
      invalidatesTags: ["Sale", "Purchase", "Inventory"],
    }),

    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Invoices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Sale",
        "Purchase",
        "Inventory",
      ],
    }),

    deleteInvoice: builder.mutation({
      query: (id) => ({ url: `Invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Sale", "Purchase", "Inventory"],
    }),
    getItemBalance: builder.query({
      query: ({ storeId, itemId, asOfDate, invoiceId }) => ({
        url: "/Invoices/item-balance",
        params: {
          storeId,
          itemId,
          asOfDate,
          invoiceId,
        },
      }),
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoicesForSummaryQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDuplicateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetItemBalanceQuery,
} = invoicesApi;
