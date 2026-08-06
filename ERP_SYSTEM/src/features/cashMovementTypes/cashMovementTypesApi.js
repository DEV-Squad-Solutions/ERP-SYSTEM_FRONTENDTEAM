// Direction is sent/received as the JSON name, never the numeric value.
// Receipt = 1 (increases cashbox, Debit Cash) | Payment = 2 (decreases cashbox, Credit Cash)

import { baseApi } from "../../lib/baseApi";

export const cashMovementTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashMovementTypes: builder.query({
      // params: { pageNumber, pageSize, search, name, direction, forPartner, isActive }
      query: (params) => ({
        url: "/CashMovementTypes",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((t) => ({
                type: "CashMovementType",
                id: t.id,
              })),
              { type: "CashMovementType", id: "LIST" },
            ]
          : [{ type: "CashMovementType", id: "LIST" }],
    }),

    getCashMovementTypeOptions: builder.query({
      // params: { direction, forPartner } — for direct voucher forms
      query: (params) => ({
        url: "/CashMovementTypes/select",
        params,
      }),
      providesTags: [{ type: "CashMovementType", id: "SELECT" }],
    }),

    getCashMovementType: builder.query({
      query: (id) => `/CashMovementTypes/${id}`,
      providesTags: (result, error, id) => [{ type: "CashMovementType", id }],
    }),

    createCashMovementType: builder.mutation({
      query: (body) => ({
        url: "/CashMovementTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "SELECT" },
      ],
    }),

    updateCashMovementType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/CashMovementTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CashMovementType", id },
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "SELECT" },
      ],
    }),

    deleteCashMovementType: builder.mutation({
      query: (id) => ({
        url: `/CashMovementTypes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "CashMovementType", id },
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "SELECT" },
      ],
    }),
  }),
});

export const {
  useGetCashMovementTypesQuery,
  useGetCashMovementTypeOptionsQuery,
  useGetCashMovementTypeQuery,
  useCreateCashMovementTypeMutation,
  useUpdateCashMovementTypeMutation,
  useDeleteCashMovementTypeMutation,
} = cashMovementTypesApi;
