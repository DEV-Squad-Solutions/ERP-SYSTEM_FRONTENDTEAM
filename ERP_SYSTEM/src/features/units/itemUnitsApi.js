import { baseApi } from "../../lib/baseApi";

export const itemUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItemUnitsSelect: builder.query({
      query: () => "ItemUnits/select",
      providesTags: ["ItemUnit"],
    }),

    // GET ItemUnits يرجع شكل paginated: { items, pageNumber, pageSize, totalCount, totalPages }
    getItemUnits: builder.query({
      query: (params) => ({
        url: "ItemUnits",
        params,
      }),
      transformResponse: (response) => response.items,
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: "ItemUnit", id: u.id })),
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
