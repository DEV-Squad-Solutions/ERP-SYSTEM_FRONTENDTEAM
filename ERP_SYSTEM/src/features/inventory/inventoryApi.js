import { baseApi } from "../../lib/baseApi";
import { mockItems, mockStockLedger } from "../../mocks/data/inventory";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      ...(USE_MOCK
        ? { queryFn: async () => ({ data: await mockDelay(mockItems) }) }
        : { query: () => "/inventory/items" }),
      providesTags: ["Inventory"],
    }),

    getStockLedger: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async ({ itemId, from, to, movementType } = {}) => {
              let data = [...mockStockLedger];
              if (itemId) data = data.filter((r) => r.itemId === itemId);
              if (from) data = data.filter((r) => r.date >= from);
              if (to) data = data.filter((r) => r.date <= to);
              if (movementType && movementType !== "all") {
                data = data.filter((r) => r.movementType === movementType);
              }
              return { data: await mockDelay(data) };
            },
          }
        : { query: (params) => ({ url: "/inventory/ledger", params }) }),
      providesTags: ["Inventory"],
    }),

    deleteStockEntry: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (id) => {
              const index = mockStockLedger.findIndex((r) => r.id === id);
              if (index !== -1) mockStockLedger.splice(index, 1);
              await mockDelay(null);
              return { data: { id } };
            },
          }
        : {
            query: (id) => ({
              url: `/inventory/ledger/${id}`,
              method: "DELETE",
            }),
          }),
      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetStockLedgerQuery,
  useDeleteStockEntryMutation,
} = inventoryApi;
