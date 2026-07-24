import { baseApi } from "../../lib/baseApi";
import { mockStoreContainers } from "../../mocks/data/Containers";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export const storeContainersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Current assignments for a Store. Used to reload state after an
    // uncertain 500 on upsert, or after a company switch.
    getStoreContainers: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (storeId) => ({
              data: await mockDelay(mockStoreContainers[storeId] ?? []),
            }),
          }
        : {
            query: (storeId) => ({
              url: `StoreContainers/${storeId}`,
              method: "GET",
            }),
          }),
      providesTags: (result, error, storeId) => [
        { type: "StoreContainer", id: storeId },
      ],
    }),

    // Admin only. containerIds is the COMPLETE final set for the store,
    // not a delta: omitted ids are soft-deleted, [] clears every
    // assignment. One atomic, idempotent transaction on the backend -
    // never auto-retried here on an uncertain error.
    upsertStoreContainers: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async ({ storeId, containerIds }) => {
              mockStoreContainers[storeId] = [...containerIds];
              return { data: await mockDelay({ storeId, containerIds }) };
            },
          }
        : {
            query: ({ storeId, containerIds }) => ({
              url: "StoreContainers/upsert",
              method: "PUT",
              body: { storeId, containerIds },
            }),
          }),
      invalidatesTags: (result, error, { storeId }) => [
        { type: "StoreContainer", id: storeId },
      ],
    }),
  }),
});

export const { useGetStoreContainersQuery, useUpsertStoreContainersMutation } =
  storeContainersApi;
