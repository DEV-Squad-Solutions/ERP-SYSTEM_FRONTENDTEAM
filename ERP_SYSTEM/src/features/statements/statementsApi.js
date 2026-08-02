import { baseApi } from "../../lib/baseApi";

export const statementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerStatement: builder.query({
      query: (params) => ({ url: "Statements/partner", params }),
      providesTags: (result, error, params) => [
        { type: "Statement", id: params.BusinessPartnerId },
      ],
    }),
    getPartnerItemMovements: builder.query({
      query: ({ businessPartnerId, itemId, countryId, fromDate, toDate }) => ({
        url: "/BusinessPartners/item-report",
        method: "GET",
        params: {
          businessPartnerId,
          itemId,
          countryId: countryId || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      }),

      providesTags: ["PartnerItemMovements"],
    }),
  }),
});

export const { useGetPartnerStatementQuery, useGetPartnerItemMovementsQuery } =
  statementsApi;
