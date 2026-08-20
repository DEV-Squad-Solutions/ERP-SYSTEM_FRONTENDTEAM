import { baseApi } from "../../lib/baseApi";

export const stockTransfersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Stock Transfers - List
    // =========================================================

    getStockTransfers: builder.query({
      query: (params = {}) => ({
        url: "StockTransfers",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({
                type: "StockTransfer",
                id,
              })),
              { type: "StockTransfer", id: "LIST" },
            ]
          : [{ type: "StockTransfer", id: "LIST" }],
    }),

    // =========================================================
    // Stock Transfer - Details
    // =========================================================

    getStockTransferById: builder.query({
      query: (id) => `StockTransfers/${id}`,

      providesTags: (result, error, id) => [{ type: "StockTransfer", id }],
    }),

    // =========================================================
    // Create
    // =========================================================

    createStockTransfer: builder.mutation({
      query: (body) => ({
        url: "StockTransfers",
        method: "POST",
        body,
      }),

      invalidatesTags: [
        { type: "StockTransfer", id: "LIST" },
        "Store",
        "StoreInventory",
        "InventoryMovement",
      ],
    }),

    // =========================================================
    // Update
    // =========================================================

    updateStockTransfer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `StockTransfers/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "StockTransfer", id },
        { type: "StockTransfer", id: "LIST" },
        "Store",
        "StoreInventory",
        "InventoryMovement",
      ],
    }),

    // =========================================================
    // Delete
    // =========================================================

    deleteStockTransfer: builder.mutation({
      query: (id) => ({
        url: `StockTransfers/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        { type: "StockTransfer", id: "LIST" },
        "Store",
        "StoreInventory",
        "InventoryMovement",
      ],
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
