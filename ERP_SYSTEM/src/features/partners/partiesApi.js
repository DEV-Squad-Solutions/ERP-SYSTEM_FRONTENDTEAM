import { baseApi } from "../../lib/baseApi";

export const partiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartiesSelect: builder.query({
      query: (params) => ({
        url: "BusinessPartners/select",
        params,
      }),
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

    getPartyById: builder.query({
      query: (id) => ({
        url: `BusinessPartners/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Party", id }],
    }),
    getPartyContainerStore: builder.query({
      query: (businessPartnerId) =>
        `/BusinessPartners/${businessPartnerId}/container-store`,
      providesTags: (result, error, businessPartnerId) => [
        { type: "ContainerStore", id: businessPartnerId },
      ],
    }),
  }),
});

export const {
  useGetPartiesSelectQuery,
  useCreatePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyContainerStoreQuery,
} = partiesApi;
