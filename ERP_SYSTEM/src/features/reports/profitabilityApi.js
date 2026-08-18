import { baseApi } from "../../lib/baseApi";

export const profitabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Invoice Profitability
    // =========================================================
    getInvoiceProfitability: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        includeReturns = true,
        fromDate,
        toDate,
        businessPartnerId,
        storeId,
        itemId,
        itemsCategoryId,
        search,
      } = {}) => {
        const params = new URLSearchParams();

        params.set("pageNumber", pageNumber);
        params.set("pageSize", pageSize);
        params.set("includeReturns", includeReturns);

        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);

        if (businessPartnerId) {
          params.set("businessPartnerId", businessPartnerId);
        }

        if (storeId) {
          params.set("storeId", storeId);
        }

        if (itemId) {
          params.set("itemId", itemId);
        }

        if (itemsCategoryId) {
          params.set("itemsCategoryId", itemsCategoryId);
        }

        if (search?.trim()) {
          params.set("search", search.trim());
        }

        return {
          url: `/Statements/profitability/invoices?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: ["InvoiceProfitability"],
    }),

    // =========================================================
    // Invoice Profitability Details
    // =========================================================
    getInvoiceProfitabilityDetails: builder.query({
      query: (invoiceId) => ({
        url: `/Statements/profitability/invoices/${invoiceId}`,
        method: "GET",
      }),

      providesTags: (_result, _error, invoiceId) => [
        {
          type: "InvoiceProfitability",
          id: invoiceId,
        },
      ],
    }),

    // =========================================================
    // Item Profitability
    // =========================================================
    getItemProfitability: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        includeReturns = true,
        fromDate,
        toDate,
        businessPartnerId,
        storeId,
        itemId,
        itemsCategoryId,
        search,
      } = {}) => {
        const params = new URLSearchParams();

        params.set("pageNumber", pageNumber);
        params.set("pageSize", pageSize);
        params.set("includeReturns", includeReturns);

        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);

        if (businessPartnerId) {
          params.set("businessPartnerId", businessPartnerId);
        }

        if (storeId) {
          params.set("storeId", storeId);
        }

        if (itemId) {
          params.set("itemId", itemId);
        }

        if (itemsCategoryId) {
          params.set("itemsCategoryId", itemsCategoryId);
        }

        if (search?.trim()) {
          params.set("search", search.trim());
        }

        return {
          url: `/Statements/profitability/items?${params.toString()}`,
          method: "GET",
        };
      },

      providesTags: ["ItemProfitability"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetInvoiceProfitabilityQuery,
  useGetInvoiceProfitabilityDetailsQuery,
  useGetItemProfitabilityQuery,
} = profitabilityApi;
