import { baseApi } from "../../lib/baseApi";

export const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountriesSelect: builder.query({
      query: () => "/Countries/select",
      providesTags: ["Country"],
    }),
  }),
});

export const { useGetCountriesSelectQuery } = countriesApi;
