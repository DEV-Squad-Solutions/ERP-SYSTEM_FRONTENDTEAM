// features/invoiceItemPricing/invoiceItemPricingApi.js

import { baseApi } from "../../lib/baseApi";

export const invoiceItemPricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceItemPricing: builder.query({
      query: (params) => ({
        url: "/InvoiceItemPricing",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((item) => ({
                type: "InvoiceItemPricing",
                id: item.invoiceLineId,
              })),
              { type: "InvoiceItemPricing", id: "LIST" },
            ]
          : [{ type: "InvoiceItemPricing", id: "LIST" }],
    }),

    updateInvoiceLineExpenses: builder.mutation({
      query: ({ invoiceLineId, expenses }) => ({
        url: `/InvoiceItemPricing/${invoiceLineId}/expenses`,
        method: "PUT",
        body: { expenses },
      }),
      invalidatesTags: (result, error, { invoiceLineId }) => [
        { type: "InvoiceItemPricing", id: invoiceLineId },
        { type: "InvoiceItemPricing", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInvoiceItemPricingQuery,
  useUpdateInvoiceLineExpensesMutation,
} = invoiceItemPricingApi;
