import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Items List
    // =========================================================
    getItems: builder.query({
      query: (params) => ({ url: "/items", method: "GET", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((i) => ({ type: "Item", id: i.id })),
              { type: "Item", id: "LIST" },
              { type: "Item", id: "SELECT" },
            ]
          : [
              { type: "Item", id: "LIST" },
              { type: "Item", id: "SELECT" },
            ],
    }),

    getItemById: builder.query({
      query: (id) => ({ url: `Items/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Item", id }],
    }),

    getItemsSelect: builder.query({
      query: (params) => ({ url: "Items/select", method: "GET", params }),
      providesTags: [{ type: "Item", id: "SELECT" }],
    }),

    createItem: builder.mutation({
      query: (data) => ({ url: "Items", method: "POST", body: data }),
      invalidatesTags: tagsFor("Item"),
    }),

    updateItem: builder.mutation({
      query: ({ id, ...body }) => ({ url: `Items/${id}`, method: "PUT", body }),
      invalidatesTags: tagsFor("Item"),
    }),

    deleteItem: builder.mutation({
      query: (id) => ({ url: `Items/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Item"),
    }),

    // =========================================================
    // Stock Ledger
    // =========================================================
    getStockLedger: builder.query({
      query: (params) => ({ url: "/inventory/ledger", method: "GET", params }),
      providesTags: ["Inventory"],
    }),

    deleteStockEntry: builder.mutation({
      query: (id) => ({ url: `/inventory/ledger/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Item"),
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
