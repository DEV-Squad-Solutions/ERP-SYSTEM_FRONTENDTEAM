// features/cashboxes/cashboxesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const cashboxesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashboxes: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 12,
        search,
        code,
        name,
        currency,
        isActive,
      } = {}) => ({
        url: "/Cashboxes",
        method: "GET",
        params: {
          pageNumber,
          pageSize,
          ...(search?.trim() && { search: search.trim() }),
          ...(code?.trim() && { code: code.trim() }),
          ...(name?.trim() && { name: name.trim() }),
          ...(currency && { currency }),
          ...(isActive !== undefined &&
            isActive !== "" && { isActive: isActive === "true" }),
        },
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((cashbox) => ({
                type: "Cashbox",
                id: cashbox.id,
              })),
              { type: "Cashbox", id: "LIST" },
            ]
          : [{ type: "Cashbox", id: "LIST" }],
    }),

    getCashboxOptions: builder.query({
      query: () => ({ url: "/Cashboxes/select", method: "GET" }),
      providesTags: [{ type: "Cashbox", id: "OPTIONS" }],
    }),

    getCashboxById: builder.query({
      query: (id) => ({ url: `/Cashboxes/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Cashbox", id }],
    }),

    createCashbox: builder.mutation({
      query: (body) => ({ url: "/Cashboxes", method: "POST", body }),
      // كان بيعمل invalidate لـ LIST/OPTIONS بس. tagsFor بتغطي كل حاجة
      // مرتبطة بالخزنة (statements/vouchers/transfers) من مصدر واحد.
      invalidatesTags: tagsFor("Cashbox"),
    }),

    updateCashbox: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Cashboxes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("Cashbox"),
    }),

    deleteCashbox: builder.mutation({
      query: (id) => ({ url: `/Cashboxes/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Cashbox"),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCashboxesQuery,
  useGetCashboxOptionsQuery,
  useGetCashboxByIdQuery,
  useCreateCashboxMutation,
  useUpdateCashboxMutation,
  useDeleteCashboxMutation,
} = cashboxesApi;
