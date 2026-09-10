// features/partners/partnerOpeningBalancesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const partnerOpeningBalancesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerOpeningBalances: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        documentNumber,
        businessPartnerId,
        currency,
        balanceType,
        fromDate,
        toDate,
      } = {}) => ({
        url: "/PartnerOpeningBalances",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          DocumentNumber: documentNumber || undefined,
          BusinessPartnerId: businessPartnerId || undefined,
          Currency: currency || undefined,
          BalanceType: balanceType || undefined,
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: "PartnerOpeningBalance",
                id: item.id,
              })),
              { type: "PartnerOpeningBalance", id: "LIST" },
            ]
          : [{ type: "PartnerOpeningBalance", id: "LIST" }],
    }),

    getPartnerOpeningBalanceById: builder.query({
      query: (id) => `/PartnerOpeningBalances/${id}`,
      providesTags: (result, error, id) => [
        { type: "PartnerOpeningBalance", id },
      ],
    }),

    createPartnerOpeningBalance: builder.mutation({
      query: (body) => ({
        url: "/PartnerOpeningBalances",
        method: "POST",
        body,
      }),
      // كانت بتعمل invalidate لـ LIST بس - مش بتحدّث كشف حساب الشريك
      // اللي فعليًا بيتأثر برصيد أول مدة.
      invalidatesTags: tagsFor("PartnerOpeningBalance"),
    }),

    updatePartnerOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/PartnerOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("PartnerOpeningBalance"),
    }),

    deletePartnerOpeningBalance: builder.mutation({
      query: (id) => ({
        url: `/PartnerOpeningBalances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("PartnerOpeningBalance"),
    }),
  }),
});

export const {
  useGetPartnerOpeningBalancesQuery,
  useGetPartnerOpeningBalanceByIdQuery,
  useCreatePartnerOpeningBalanceMutation,
  useUpdatePartnerOpeningBalanceMutation,
  useDeletePartnerOpeningBalanceMutation,
} = partnerOpeningBalancesApi;
