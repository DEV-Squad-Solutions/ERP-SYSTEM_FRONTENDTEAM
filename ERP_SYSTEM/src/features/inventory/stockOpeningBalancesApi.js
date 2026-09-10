// features/inventory/stockOpeningBalancesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const stockOpeningBalancesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockOpeningBalances: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        documentNumber,
        storeId,
        fromDate,
        toDate,
      } = {}) => ({
        url: "/StockOpeningBalances",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          DocumentNumber: documentNumber || undefined,
          StoreId: storeId || undefined,
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: "StockOpeningBalance",
                id: item.id,
              })),
              { type: "StockOpeningBalance", id: "LIST" },
            ]
          : [{ type: "StockOpeningBalance", id: "LIST" }],
    }),

    getStockOpeningBalanceById: builder.query({
      query: (id) => `/StockOpeningBalances/${id}`,
      providesTags: (result, error, id) => [
        { type: "StockOpeningBalance", id },
      ],
    }),

    createStockOpeningBalance: builder.mutation({
      query: (body) => ({ url: "/StockOpeningBalances", method: "POST", body }),
      // كانت بتعمل invalidate لـ LIST بس - مش بتأثر على تقارير المخزون
      // (StoreStockReport/InventoryCostReport) اللي فعليًا بتتغيّر برصيد أول مدة.
      invalidatesTags: tagsFor("StockOpeningBalance"),
    }),

    updateStockOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/StockOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("StockOpeningBalance"),
    }),

    deleteStockOpeningBalance: builder.mutation({
      query: (id) => ({ url: `/StockOpeningBalances/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("StockOpeningBalance"),
    }),
  }),
});

export const {
  useGetStockOpeningBalancesQuery,
  useGetStockOpeningBalanceByIdQuery,
  useCreateStockOpeningBalanceMutation,
  useUpdateStockOpeningBalanceMutation,
  useDeleteStockOpeningBalanceMutation,
} = stockOpeningBalancesApi;
