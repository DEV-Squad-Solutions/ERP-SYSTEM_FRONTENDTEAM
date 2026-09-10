import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const stockAdjustmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockAdjustments: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        documentNumber,
        storeId,
        direction,
        fromDate,
        toDate,
      } = {}) => ({
        url: "/StockAdjustments",
        method: "GET",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(documentNumber && { DocumentNumber: documentNumber }),
          ...(storeId && { StoreId: storeId }),
          ...(direction && { Direction: direction }),
          ...(fromDate && { FromDate: fromDate }),
          ...(toDate && { ToDate: toDate }),
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((a) => ({
                type: "StockAdjustment",
                id: a.id,
              })),
              { type: "StockAdjustment", id: "LIST" },
            ]
          : [{ type: "StockAdjustment", id: "LIST" }],
    }),

    getStockAdjustmentById: builder.query({
      query: (id) => ({ url: `StockAdjustments/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "StockAdjustment", id }],
    }),

    createStockAdjustment: builder.mutation({
      query: (body) => ({ url: "/StockAdjustments", method: "POST", body }),
      invalidatesTags: tagsFor("StockAdjustment"),
    }),

    // لازم الـ body يحتوي rowVersion من آخر GET عشان الـ optimistic concurrency.
    updateStockAdjustment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `StockAdjustments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("StockAdjustment"),
    }),

    deleteStockAdjustment: builder.mutation({
      query: (id) => ({ url: `StockAdjustments/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("StockAdjustment"),
    }),
  }),
});

export const {
  useGetStockAdjustmentsQuery,
  useGetStockAdjustmentByIdQuery,
  useCreateStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
} = stockAdjustmentsApi;
