import { baseApi } from "../../lib/baseApi";

export const containerStoreStatementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContainerStoreStatement: builder.query({
      query: (params) => ({
        url: "/Statements/container-store",
        method: "GET",
        params,
      }),
      providesTags: (result, error, params) => [
        {
          type: "ContainerStoreStatement",
          id: params.BusinessPartnerId ?? "LIST",
        },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetContainerStoreStatementQuery } =
  containerStoreStatementApi;
