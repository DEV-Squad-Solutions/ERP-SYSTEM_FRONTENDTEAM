import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const stockTransfersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockTransfers: builder.query({
      query: (params = {}) => ({ url: "StockTransfers", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "StockTransfer", id })),
              { type: "StockTransfer", id: "LIST" },
            ]
          : [{ type: "StockTransfer", id: "LIST" }],
    }),

    getStockTransferById: builder.query({
      query: (id) => `StockTransfers/${id}`,
      providesTags: (result, error, id) => [{ type: "StockTransfer", id }],
    }),

    createStockTransfer: builder.mutation({
      query: (body) => ({ url: "StockTransfers", method: "POST", body }),
      // كانت بتعمل invalidate لـ "StoreInventory" و"InventoryMovement" -
      // التاجين دول محدش بيوفرهم في أي query تاني في المشروع كله، يعني
      // كانوا dead invalidation (بيتنفذوا لكن معندهمش تأثير). صححناها
      // للتاجات الحقيقية اللي بتتعرض فعلاً (Inventory/StoreStockReport/
      // InventoryCostReport/Store).
      invalidatesTags: tagsFor("StockTransfer"),
    }),

    updateStockTransfer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `StockTransfers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("StockTransfer"),
    }),

    deleteStockTransfer: builder.mutation({
      query: (id) => ({ url: `StockTransfers/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("StockTransfer"),
    }),
  }),
});

export const {
  useGetStockTransfersQuery,
  useGetStockTransferByIdQuery,
  useCreateStockTransferMutation,
  useUpdateStockTransferMutation,
  useDeleteStockTransferMutation,
} = stockTransfersApi;
