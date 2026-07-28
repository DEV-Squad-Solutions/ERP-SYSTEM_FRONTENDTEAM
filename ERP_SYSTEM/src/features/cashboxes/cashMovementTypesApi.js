// features/cashboxes/cashMovementTypesApi.js
import { baseApi } from "../../lib/baseApi";

export const cashMovementTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashMovementTypes: builder.query({
      query: ({ pageNumber = 1, pageSize = 50 } = {}) => ({
        url: "/CashMovementTypes",
        method: "GET",
        params: { pageNumber, pageSize },
      }),
      providesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),

    getCashMovementTypeOptions: builder.query({
      query: (params) => ({
        url: "/CashMovementTypes/select",
        params,
        method: "GET",
      }),
      providesTags: [{ type: "CashMovementType", id: "OPTIONS" }],
    }),

    createCashMovementType: builder.mutation({
      query: (body) => ({
        url: "/CashMovementTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "OPTIONS" },
      ],
    }),

    updateCashMovementType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/CashMovementTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "OPTIONS" },
      ],
    }),

    deleteCashMovementType: builder.mutation({
      query: (id) => ({
        url: `/CashMovementTypes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "CashMovementType", id: "LIST" },
        { type: "CashMovementType", id: "OPTIONS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCashMovementTypesQuery,
  useGetCashMovementTypeOptionsQuery,
  useCreateCashMovementTypeMutation,
  useUpdateCashMovementTypeMutation,
  useDeleteCashMovementTypeMutation,
} = cashMovementTypesApi;
