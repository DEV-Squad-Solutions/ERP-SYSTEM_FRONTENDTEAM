// features/cashboxes/cashMovementTypesApi.js
import { baseApi } from "../../lib/baseApi";
export const cashMovementTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/CashMovementTypes (paginated - لصفحة إدارة الأنواع لو هتعملها)
    getCashMovementTypes: builder.query({
      query: (params = {}) => ({
        url: "/CashMovementTypes",
        params: {
          PageNumber: params.pageNumber,
          PageSize: params.pageSize,
          Search: params.search || undefined,
          Name: params.name || undefined,
          Direction: params.direction || undefined,
          ForPartner: params.forPartner,
          IsActive: params.isActive,
        },
      }),
      providesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),

    // GET /api/v1/CashMovementTypes/select
    getCashMovementTypeOptions: builder.query({
      query: ({ direction, forPartner } = {}) => ({
        url: "/CashMovementTypes/select",
        params: {
          Direction: direction || undefined,
          ForPartner: forPartner,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "CashMovementType", id: `SELECT-${arg?.forPartner}` },
      ],
    }),

    createCashMovementType: builder.mutation({
      query: (body) => ({ url: "/CashMovementTypes", method: "POST", body }),
      invalidatesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),

    updateCashMovementType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/CashMovementTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),

    deleteCashMovementType: builder.mutation({
      query: (id) => ({ url: `/CashMovementTypes/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCashMovementTypesQuery,
  useGetCashMovementTypeOptionsQuery,
  useCreateCashMovementTypeMutation,
  useUpdateCashMovementTypeMutation,
  useDeleteCashMovementTypeMutation,
} = cashMovementTypesApi;
