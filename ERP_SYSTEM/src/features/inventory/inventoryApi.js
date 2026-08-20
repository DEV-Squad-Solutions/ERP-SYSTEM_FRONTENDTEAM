import { baseApi } from "../../lib/baseApi";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Items List
    // =========================================================
    getItems: builder.query({
      query: (params) => ({
        url: "/items",
        method: "GET",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((i) => ({
                type: "Item",
                id: i.id,
              })),
              { type: "Item", id: "LIST" },
              { type: "Item", id: "SELECT" },
            ]
          : [
              { type: "Item", id: "LIST" },
              { type: "Item", id: "SELECT" },
            ],
    }),

    // =========================================================
    // Item Details
    // =========================================================
    getItemById: builder.query({
      query: (id) => ({
        url: `Items/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [{ type: "Item", id }],
    }),

    // =========================================================
    // Items Select
    // =========================================================
    getItemsSelect: builder.query({
      query: (params) => ({
        url: "Items/select",
        method: "GET",
        params,
      }),

      providesTags: [{ type: "Item", id: "SELECT" }],
    }),

    // =========================================================
    // Create Item
    // =========================================================
    createItem: builder.mutation({
      query: (data) => ({
        url: "Items",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        { type: "Item", id: "LIST" },
        { type: "Item", id: "SELECT" },
      ],
    }),

    // =========================================================
    // Update Item
    // =========================================================
    updateItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Items/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
        { type: "Item", id: "SELECT" },

        // اسم / كود الصنف ممكن يظهر في أرصدة المخازن
        { type: "StoreStockReport" },
      ],
    }),

    // =========================================================
    // Delete Item
    // =========================================================
    deleteItem: builder.mutation({
      query: (id) => ({
        url: `Items/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
        { type: "Item", id: "SELECT" },

        // الصنف المحذوف يختفي من قوائم أرصدة المخازن
        { type: "StoreStockReport" },
      ],
    }),

    // =========================================================
    // Stock Ledger
    // =========================================================
    getStockLedger: builder.query({
      query: (params) => ({
        url: "/inventory/ledger",
        method: "GET",
        params,
      }),

      providesTags: ["Inventory"],
    }),

    // =========================================================
    // Delete Stock Entry
    // =========================================================
    deleteStockEntry: builder.mutation({
      query: (id) => ({
        url: `/inventory/ledger/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetStockLedgerQuery,
  useDeleteStockEntryMutation,
  useGetItemsSelectQuery,
} = inventoryApi;
