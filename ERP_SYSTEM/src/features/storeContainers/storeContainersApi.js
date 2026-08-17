import { baseApi } from "../../lib/baseApi";

export const storeContainersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // الحاويات المعينة حاليًا على مخزن معين
    getStoreContainers: builder.query({
      query: (storeId) => ({
        url: `StoreContainers/${storeId}`,
        method: "GET",
      }),

      providesTags: (result, error, storeId) => [
        { type: "StoreContainer", id: storeId },
      ],
    }),

    // استبدال المجموعة كاملة
    // containerIds = القائمة النهائية للحاويات المعينة للمخزن
    upsertStoreContainers: builder.mutation({
      query: ({ storeId, containerIds }) => ({
        url: "StoreContainers/upsert",
        method: "PUT",
        body: {
          storeId,
          containerIds,
        },
      }),

      invalidatesTags: (result, error, { storeId }) => [
        { type: "StoreContainer", id: storeId },
        "ContainerStoreStatement",
      ],
    }),
  }),
});

export const { useGetStoreContainersQuery, useUpsertStoreContainersMutation } =
  storeContainersApi;
