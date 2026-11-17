import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

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
        body: { storeId, containerIds },
      }),
      // كانت بتعمل invalidate لتاج اسمه "ContainerStoreStatement" -
      // التاج ده محدش بيوفره في أي query في المشروع (اللي بيتوفر فعلاً
      // هو "ContainerStore" من partiesApi.getPartyContainerStore).
      // يعني كانت dead invalidation. صححناها لـ tagsFor("StoreContainer")
      // اللي بتغطي StoreContainer/ContainerStore/Inventory مع بعض.
      invalidatesTags: (result, error, { storeId }) =>
        tagsFor("StoreContainer", [{ type: "StoreContainer", id: storeId }]),
    }),
    // إضافة حركة عبوة يدوية بدون فاتورة
    createContainerMovement: builder.mutation({
      query: (body) => ({
        url: "ContainerMovements",
        method: "POST",
        body,
      }),
      invalidatesTags: tagsFor("ContainerMovement"),
    }),

    // تعديل حركة يدوية (حركات الفواتير غير قابلة للتعديل)
    updateContainerMovement: builder.mutation({
      query: ({ id, body }) => ({
        url: `ContainerMovements/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("ContainerMovement"),
    }),

    // حذف حركة يدوية (يتطلب بصمة السجل لمنع التعارض)
    deleteContainerMovement: builder.mutation({
      query: ({ id, rowVersion }) => ({
        url: `ContainerMovements/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),
      invalidatesTags: tagsFor("ContainerMovement"),
    }),
  }),
});

export const {
  useGetStoreContainersQuery,
  useUpsertStoreContainersMutation,
  useCreateContainerMovementMutation,
  useUpdateContainerMovementMutation,
  useDeleteContainerMovementMutation,
} = storeContainersApi;
