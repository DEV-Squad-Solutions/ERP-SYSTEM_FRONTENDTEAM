import { baseApi } from "../../lib/baseApi";
import { mockSalesLines } from "../../mocks/data/sales";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceDetail: builder.query({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        if (!USE_MOCK) {
          return baseQuery({ url: `/sales-invoices/${id}` });
        }
        const result = mockSalesLines.find((invoice) => invoice.id === id);
        console.log(result);
        return { data: await mockDelay(result) };
      },
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    duplicateInvoice: builder.mutation({
      query: (id) => ({
        url: `/sales-invoices/${id}/duplicate`,
        method: "POST",
      }),
      // مفيش داعي لعمل invalidate هنا لأن ده بيرجع فاتورة جديدة مختلفة
    }),

    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/sales-invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    getInvoicePackaging: builder.query({
      query: (id) => `/sales-invoices/${id}/packaging`,
      providesTags: (result, error, id) => [{ type: "InvoicePackaging", id }],
    }),

    receivePackaging: builder.mutation({
      // payload: { invoiceId, unit, quantity }
      query: ({ invoiceId, ...body }) => ({
        url: `/sales-invoices/${invoiceId}/packaging/receive`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "InvoicePackaging", id: invoiceId },
      ],
    }),

    deliverPackaging: builder.mutation({
      // payload: { invoiceId, unit, quantity }
      query: ({ invoiceId, ...body }) => ({
        url: `/sales-invoices/${invoiceId}/packaging/deliver`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "InvoicePackaging", id: invoiceId },
      ],
    }),

    getInvoiceAuditLog: builder.query({
      query: (id) => `/sales-invoices/${id}/audit-log`,
      providesTags: (result, error, id) => [{ type: "InvoiceAuditLog", id }],
    }),
  }),
});

export const {
  useGetInvoiceDetailQuery,
  useDuplicateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetInvoicePackagingQuery,
  useReceivePackagingMutation,
  useDeliverPackagingMutation,
  useGetInvoiceAuditLogQuery,
} = invoicesApi;
