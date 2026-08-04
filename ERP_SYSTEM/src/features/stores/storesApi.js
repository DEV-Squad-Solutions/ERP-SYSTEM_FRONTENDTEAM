import { baseApi } from "../../lib/baseApi";
import { mockStores } from "../../mocks/data/stores";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        search,
        code,
        name,
        businessPartnerId,
        isContainerStore,
        isActive,
      } = {}) => ({
        url: "/Stores",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(code && { Code: code }),
          ...(name && { Name: name }),
          ...(businessPartnerId && { BusinessPartnerId: businessPartnerId }),
          ...(isContainerStore !== undefined && {
            IsContainerStore: isContainerStore,
          }),
          ...(isActive !== undefined && { IsActive: isActive }),
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((s) => ({ type: "Store", id: s.id })),
              { type: "Store", id: "LIST" },
            ]
          : [{ type: "Store", id: "LIST" }],
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

    createStore: builder.mutation({
      query: (body) => ({
        url: "/Stores",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "LIST" }],
    }),
    updateStore: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Stores/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Store", id },
        { type: "Store", id: "LIST" },
      ],
    }),
    deleteStore: builder.mutation({
      query: (id) => ({
        url: `/Stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Store", id },
        { type: "Store", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetStoresSelectQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storesApi;
