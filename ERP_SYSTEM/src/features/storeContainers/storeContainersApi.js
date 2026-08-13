import { baseApi } from "../../lib/baseApi";

export const storeContainersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Current assignments for a Store. Used to reload state after an
    // uncertain 500 on upsert, or after a company switch.
    getStoreContainers: builder.query({
      query: (storeId) => ({
        url: `StoreContainers/${storeId}`,
        method: "GET",
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
      query: ({ storeId, containerIds }) => ({
        url: "StoreContainers/upsert",
        method: "PUT",
        body: { storeId, containerIds },
      }),
      invalidatesTags: (result, error, { storeId }) => [
        { type: "StoreContainer", id: storeId },
      ],
    }),
  }),
});

export const { useGetStoreContainersQuery, useUpsertStoreContainersMutation } =
  storeContainersApi;
