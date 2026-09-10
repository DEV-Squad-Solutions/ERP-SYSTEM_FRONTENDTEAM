import { baseApi } from "../../lib/baseApi";

export const itemUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItemUnitsSelect: builder.query({
      query: () => "ItemUnits/select",
      providesTags: ["ItemUnit"],
      // بيانات وحدات القياس بتتغير نادر جدًا، فنسيبها في الكاش لمدة أطول
      // بدل الافتراضي (60 ثانية) عشان نقلل النداءات المتكررة كل ما ندخل فورم فيه select
      keepUnusedDataFor: 300,
    }),

    // GET ItemUnits يرجع { items, pageNumber, pageSize, totalCount, totalPages }
    getItemUnits: builder.query({
      query: (params) => ({
        url: "ItemUnits",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((u) => ({ type: "ItemUnit", id: u.id })),
              { type: "ItemUnit", id: "LIST" },
            ]
          : [{ type: "ItemUnit", id: "LIST" }],
    }),

    getItemUnit: builder.query({
      query: (id) => `ItemUnits/${id}`,
      providesTags: (result, error, id) => [{ type: "ItemUnit", id }],
    }),

    createItemUnit: builder.mutation({
      query: (body) => ({
        url: "ItemUnits",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ItemUnit", id: "LIST" }, "ItemUnit"],
    }),

    updateItemUnit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `ItemUnits/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ItemUnit", id },
        { type: "ItemUnit", id: "LIST" },
        "ItemUnit",
      ],
    }),

    deleteItemUnit: builder.mutation({
      query: (id) => ({
        url: `ItemUnits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ItemUnit", id: "LIST" }, "ItemUnit"],
    }),
  }),
});

export const {
  useGetItemUnitsSelectQuery,
  useGetItemUnitsQuery,
  useGetItemUnitQuery,
  useCreateItemUnitMutation,
  useUpdateItemUnitMutation,
  useDeleteItemUnitMutation,
} = itemUnitsApi;
