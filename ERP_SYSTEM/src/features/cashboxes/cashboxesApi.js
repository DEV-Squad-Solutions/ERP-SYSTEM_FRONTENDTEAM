// features/cashboxes/cashboxesApi.js
import { baseApi } from "../../lib/baseApi";

export const cashboxesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashboxes: builder.query({
      query: ({ pageNumber = 1, pageSize = 20, search } = {}) => ({
        url: "/Cashboxes",
        method: "GET",
        params: { pageNumber, pageSize, ...(search ? { search } : {}) },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((c) => ({ type: "Cashbox", id: c.id })),
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
      invalidatesTags: [
        { type: "Cashbox", id: "LIST" },
        { type: "Cashbox", id: "OPTIONS" },
      ],
    }),

    // PUT /api/v1/Cashboxes/{id}
    updateCashbox: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Cashboxes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Cashbox", id },
        { type: "Cashbox", id: "LIST" },
        { type: "Cashbox", id: "OPTIONS" },
      ],
    }),

    // DELETE /api/v1/Cashboxes/{id}
    deleteCashbox: builder.mutation({
      query: (id) => ({ url: `/Cashboxes/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Cashbox", id: "LIST" },
        { type: "Cashbox", id: "OPTIONS" },
      ],
    }),
    transferBetweenCashboxes: builder.mutation({
      query: (data) => ({
        url: "Cashboxes/transfer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Cashbox", id: "LIST" }],
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
  useTransferBetweenCashboxesMutation,
} = cashboxesApi;
