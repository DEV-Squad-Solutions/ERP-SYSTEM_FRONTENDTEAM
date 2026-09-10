import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountriesSelect: builder.query({
      query: () => "/Countries/select",
      providesTags: ["Country"],
      keepUnusedDataFor: 300,
    }),

    getCountries: builder.query({
      query: (params) => ({ url: "Countries", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((c) => ({ type: "Country", id: c.id })),
              { type: "Country", id: "LIST" },
            ]
          : [{ type: "Country", id: "LIST" }],
    }),

    getCountry: builder.query({
      query: (id) => `Countries/${id}`,
      providesTags: (result, error, id) => [{ type: "Country", id }],
    }),

    createCountry: builder.mutation({
      query: (body) => ({ url: "Countries", method: "POST", body }),
      invalidatesTags: tagsFor("Country"),
    }),

    updateCountry: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Countries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("Country"),
    }),

    deleteCountry: builder.mutation({
      query: (id) => ({ url: `Countries/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Country"),
    }),
  }),
});

export const {
  useGetCountriesSelectQuery,
  useGetCountriesQuery,
  useGetCountryQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countriesApi;
