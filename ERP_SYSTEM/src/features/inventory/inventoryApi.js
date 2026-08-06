import { baseApi } from "../../lib/baseApi";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: (params) => ({
        url: "/items",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((i) => ({ type: "Item", id: i.id })),
              { type: "Item", id: "LIST" },
            ]
          : [{ type: "Item", id: "LIST" }],
    }),

    getItemById: builder.query({
      query: (id) => ({ url: `Items/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Item", id }],
    }),

    getItemsSelect: builder.query({
      query: (params) => ({ url: "Items/select", params }),
      providesTags: ["Item"],
    }),

    createItem: builder.mutation({
      query: (data) => ({ url: "Items", method: "POST", body: data }),
      invalidatesTags: [{ type: "Item", id: "LIST" }],
    }),

    updateItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Items/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
        { type: "StoreStockReport" }, // اسم/كود الصنف بيتغير في أي مخزن ظاهر فيه
      ],
    }),

    deleteItem: builder.mutation({
      query: (id) => ({
        url: `Items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Item", id },
        { type: "Item", id: "LIST" },
        { type: "StoreStockReport" }, // الصنف المحذوف يختفي من قوائم أرصدة المخازن
      ],
    }),

    getStockLedger: builder.query({
      query: (params) => ({ url: "/inventory/ledger", params }),
      providesTags: ["Inventory"],
    }),
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
