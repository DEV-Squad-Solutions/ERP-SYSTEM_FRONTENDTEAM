import { baseApi } from "../../lib/baseApi";
import { mockStores } from "../../mocks/data/stores";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async () => ({ data: await mockDelay([...mockStores]) }),
          }
        : {
            query: () => ({ url: "/Stores", method: "GET" }),
          }),
      providesTags: ["Store"],
    }),

    getStoreById: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (id) => {
              const store = mockStores.find((s) => s.id === id) ?? null;
              return { data: await mockDelay(store) };
            },
          }
        : {
            query: (id) => ({ url: `Stores/${id}`, method: "GET" }),
          }),
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),

    // Company-isolated select list, used if a store needs to be picked
    // rather than created (e.g. resuming a skipped setup).
    getStoresSelect: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (params) => {
              let data = [...mockStores];
              if (params?.businessPartnerId) {
                data = data.filter(
                  (s) => s.businessPartnerId === params.businessPartnerId,
                );
              }
              return { data: await mockDelay(data) };
            },
          }
        : {
            query: (params) => ({
              url: "Stores/select",
              method: "GET",
              params,
            }),
          }),
      providesTags: ["Store"],
    }),

    // Step 2 of the guided journey. Sends businessPartnerId to link the
    // store to the customer created in Step 1.
    createStore: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (data) => {
              const created = { id: `str-${mockStores.length + 1}`, ...data };
              mockStores.push(created);
              return { data: await mockDelay(created) };
            },
          }
        : {
            query: (data) => ({ url: "Stores", method: "POST", body: data }),
          }),
      invalidatesTags: ["Store"],
    }),

    updateStore: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async ({ id, ...data }) => {
              const index = mockStores.findIndex((s) => s.id === id);
              if (index !== -1)
                mockStores[index] = { ...mockStores[index], ...data };
              return { data: await mockDelay(mockStores[index]) };
            },
          }
        : {
            query: ({ id, ...data }) => ({
              url: `Stores/${id}`,
              method: "PUT",
              body: data,
            }),
          }),
      invalidatesTags: (result, error, { id }) => [{ type: "Store", id }],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetStoresSelectQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
} = storesApi;
