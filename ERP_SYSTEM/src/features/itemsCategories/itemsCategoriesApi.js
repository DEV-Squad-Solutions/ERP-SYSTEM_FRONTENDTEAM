// features/itemsCategories/itemsCategoriesApi.js
import { baseApi } from "../../lib/baseApi";

export const itemsCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItemsCategories: builder.query({
      query: ({ page = 1, pageSize = 20, search, isActive } = {}) => ({
        url: "ItemsCategories",
        params: {
          PageNumber: page,
          PageSize: pageSize,
          Search: search || undefined,
          IsActive: isActive === "" ? undefined : isActive,
        },
      }),
      providesTags: ["ItemsCategory"],
    }),

    getItemsCategoriesSelect: builder.query({
      query: () => ({ url: "ItemsCategories/select" }),
      providesTags: ["ItemsCategory"],
    }),

    createItemCategory: builder.mutation({
      query: (body) => ({
        url: "ItemsCategories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ItemsCategory"],
    }),
  }),
});

export const {
  useGetItemsCategoriesQuery,
  useGetItemsCategoriesSelectQuery,
  useCreateItemCategoryMutation,
} = itemsCategoriesApi;
