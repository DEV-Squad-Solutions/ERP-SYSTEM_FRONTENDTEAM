// features/cashboxes/cashMovementTypesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const cashMovementTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashMovementTypes: builder.query({
      query: (params = {}) => ({
        url: "/CashMovementTypes",
        params: {
          PageNumber: params.pageNumber,
          PageSize: params.pageSize,
          Search: params.search || undefined,
          Name: params.name || undefined,
          Direction: params.direction || undefined,
          Classification: params.classification || undefined,
          ForPartner: params.forPartner,
          IsActive: params.isActive,
        },
      }),
      providesTags: [{ type: "CashMovementType", id: "LIST" }],
    }),

    getCashMovementTypeOptions: builder.query({
      query: ({ direction, classification, forPartner } = {}) => ({
        url: "/CashMovementTypes/select",
        params: {
          Direction: direction || undefined,
          Classification: classification || undefined,
          ForPartner: forPartner,
        },
      }),
      providesTags: (result, error, arg) => [
        {
          type: "CashMovementType",
          id: `SELECT-${arg?.direction}-${arg?.classification}-${arg?.forPartner}`,
        },
      ],
    }),

    createCashMovementType: builder.mutation({
      query: (body) => ({ url: "/CashMovementTypes", method: "POST", body }),
      // تصنيف جديد (مصروف/إيراد) لازم يظهر فورًا في قائمة الحساب بسند القبض/الصرف
      invalidatesTags: tagsFor("CashMovementType"),
    }),

    updateCashMovementType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/CashMovementTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("CashMovementType"),
    }),

    deleteCashMovementType: builder.mutation({
      query: (id) => ({ url: `/CashMovementTypes/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("CashMovementType"),
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
