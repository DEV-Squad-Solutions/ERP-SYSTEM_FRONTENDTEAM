// features/partners/partnerOpeningBalancesApi.js
import { baseApi } from "../../lib/baseApi";

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
      invalidatesTags: [{ type: "PartnerOpeningBalance", id: "LIST" }],
    }),

    updatePartnerOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/PartnerOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PartnerOpeningBalance", id: arg.id },
        { type: "PartnerOpeningBalance", id: "LIST" },
      ],
    }),

    deletePartnerOpeningBalance: builder.mutation({
      query: (id) => ({
        url: `/PartnerOpeningBalances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PartnerOpeningBalance", id },
        { type: "PartnerOpeningBalance", id: "LIST" },
      ],
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
