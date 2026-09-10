import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

// =========================================================
// MOVEMENT TYPE → INVOICE TYPE
// =========================================================
const MOVEMENT_TYPE_TO_INVOICE_TYPE = {
  sale: "Sales",
  purchase: "Purchase",
  sale_return: "SalesReturn",
  purchase_return: "PurchaseReturn",
};

const INVOICE_TYPE_TO_TAG = {
  Sales: "Sale",
  Purchase: "Purchase",
  SalesReturn: "SaleReturn",
  PurchaseReturn: "PurchaseReturn",
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

function getInvoiceListTags(movementType) {
  const invoiceType = MOVEMENT_TYPE_TO_INVOICE_TYPE[movementType];
  const tags = [{ type: "Invoice", id: "LIST" }];
  const specificTag = INVOICE_TYPE_TO_TAG[invoiceType];

  if (specificTag) {
    tags.push({ type: specificTag, id: "LIST" });
    return tags;
  }

  tags.push(
    { type: "Sale", id: "LIST" },
    { type: "Purchase", id: "LIST" },
    { type: "SaleReturn", id: "LIST" },
    { type: "PurchaseReturn", id: "LIST" },
  );
  return tags;
}

// كل موديولات الفاتورة اتنقلت لـ resourceTagsMap.Invoice — مصدر واحد
// بدل ما تتكرر هنا وفي كل مكان تاني بيأثر في الفاتورة.
const invoiceInvalidationTags = tagsFor("Invoice");

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
      providesTags: (result, error, arg) =>
        getInvoiceListTags(arg?.movementType),
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
      providesTags: [
        { type: "Invoice", id: "LIST" },
        { type: "Sale", id: "LIST" },
        { type: "Purchase", id: "LIST" },
        { type: "SaleReturn", id: "LIST" },
        { type: "PurchaseReturn", id: "LIST" },
      ],
    }),

    getInvoiceById: builder.query({
      query: (id) => ({ url: `Invoices/${id}` }),
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    createInvoice: builder.mutation({
      query: (data) => ({ url: "Invoices", method: "POST", body: data }),
      invalidatesTags: invoiceInvalidationTags,
    }),

    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Invoices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        ...invoiceInvalidationTags,
      ],
    }),

    deleteInvoice: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `Invoices/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoice", id },
        ...invoiceInvalidationTags,
      ],
    }),

    // =========================================================
    // Item Balance
    // -----------------------------------------------------------
    // ملحوظة مهمة: الـ endpoint ده كان معرّف مرتين (هنا وفي storesApi)
    // على نفس الـ URL بالظبط، يعني نسختين منفصلتين من نفس البيانات
    // في الكاش ممكن يختلفوا مع بعض. سيبناها هنا بس وحذفناها من
    // storesApi. لو عندك كود بيستورد useLazyGetItemBalanceQuery من
    // storesApi، حوّله يستورد useLazyGetItemBalanceQuery من هنا.
    // =========================================================
    getItemBalance: builder.query({
      query: ({ storeId, itemId, asOfDate, invoiceId }) => ({
        url: "Invoices/item-balance",
        params: { storeId, itemId, asOfDate, invoiceId },
      }),
      // كانت من غير providesTags خالص، يعني putItemPricingExpenses في
      // storesApi كان بيعمل invalidate لتاج محدش بيوفره أصلاً (dead code).
      providesTags: (result, error, { itemId } = {}) => [
        { type: "ItemBalance", id: itemId },
      ],
      keepUnusedDataFor: 30,
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
      providesTags: ["Invoice"],
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
  useLazyGetItemBalanceQuery,
  useGetReturnSourcesQuery,
} = invoicesApi;
