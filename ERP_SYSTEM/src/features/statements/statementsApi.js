import { baseApi } from "../../lib/baseApi";

export const statementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerStatement: builder.query({
      query: (params) => ({ url: "Statements/partner", params }),
      providesTags: (result, error, params) => [
        { type: "Statement", id: params.BusinessPartnerId },
      ],
    }),
  }),
});

export const { useGetPartnerStatementQuery } = statementsApi;
