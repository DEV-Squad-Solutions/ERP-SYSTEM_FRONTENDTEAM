import { baseApi } from "../../lib/baseApi";

export const partiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParties: builder.query({
      query: (params) => ({
        url: "BusinessPartners",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "Party", id: p.id })),
              { type: "Party", id: "LIST" },
            ]
          : [{ type: "Party", id: "LIST" }],
    }),
    getPartiesSelect: builder.query({
      query: (params) => ({
        url: "BusinessPartners/select",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map((p) => ({ type: "Party", id: p.id })),
              { type: "Party", id: "LIST" },
            ]
          : result?.items
            ? [
                ...result.items.map((p) => ({ type: "Party", id: p.id })),
                { type: "Party", id: "LIST" },
              ]
            : [{ type: "Party", id: "LIST" }],
    }),

    createParty: builder.mutation({
      query: (data) => ({
        url: "BusinessPartners",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Party", id: "LIST" }],
    }),

    updateParty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `BusinessPartners/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Party", id },
        { type: "Party", id: "LIST" },
      ],
    }),

    deleteParty: builder.mutation({
      query: (id) => ({
        url: `BusinessPartners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Party", id },
        { type: "Party", id: "LIST" },
      ],
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
  useGetPartiesQuery,
  useGetPartiesSelectQuery,
  useCreatePartyMutation,
  useUpdatePartyMutation,
  useDeletePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyContainerStoreQuery,
} = partiesApi;
