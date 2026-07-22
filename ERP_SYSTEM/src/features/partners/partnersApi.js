import { baseApi } from "../../lib/baseApi";

export const partiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartiesSelect: builder.query({
      query: (params) => ({ url: "BusinessPartners/select", params }),
      providesTags: ["Party"],
    }),
    createParty: builder.mutation({
      query: (data) => ({
        url: "BusinessPartners",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const { useGetPartiesSelectQuery, useCreatePartyMutation } = partiesApi;
