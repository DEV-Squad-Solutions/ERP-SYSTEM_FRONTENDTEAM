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
    countryId: country || undefined,
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

    // نفس الفلاتر بالظبط، بس PageSize كبيرة عشان نجيب كل النتائج المطابقة
    // (مستخدمة لحساب الملخص/الكروت بس، مش للجدول)
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
        body: {
          invoiceType: body.invoiceType,
          paymentTerm: body.paymentTerm,
          invoiceDate: body.invoiceDate,
          dueDate: body.dueDate,
          businessPartnerId: body.businessPartnerId,
          storeId: body.storeId,
          containerStoreId: body.containerStoreId,
          countryId: body.countryId,
          driverId: body.driverId,
          actualDriverId: body.actualDriverId,
          usesExternalDriver: body.usesExternalDriver,
          externalDriverName: body.externalDriverName,
          vehicleNumber: body.vehicleNumber,
          exportInvoiceCode: body.exportInvoiceCode,
          discountAmount: body.discountAmount,
          paidAmount: body.paidAmount,
          notes: body.notes,
          lines: body.lines.map((l) => ({
            itemId: l.itemId,
            count: l.count,
            weight: l.weight,
            price: l.price,
            notes: l.notes,
          })),
          containerLines: body.containerLines.map((c) => ({
            containerId: c.containerId,
            outgoingUnits: c.outgoingUnits,
            incomingUnits: c.incomingUnits,
          })),
          rowVersion: body.rowVersion,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        "Sale",
        "Purchase",
        "Inventory",
      ],
    }),

    duplicateInvoice: builder.mutation({
      query: (id) => ({ url: `Invoices/${id}/duplicate`, method: "POST" }),
      invalidatesTags: ["Sale", "Purchase"],
    }),

    deleteInvoice: builder.mutation({
      query: (id) => ({ url: `Invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Sale", "Purchase", "Inventory"],
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
} = invoicesApi;
