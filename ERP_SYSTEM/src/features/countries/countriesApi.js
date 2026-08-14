import { baseApi } from "../../lib/baseApi";

export const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountriesSelect: builder.query({
      query: () => "/Countries/select",
      providesTags: ["Country"],
    }),

    // GET Countries يرجع { items, pageNumber, pageSize, totalCount, totalPages }
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
      query: (body) => ({
        url: "Countries",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Country", id: "LIST" }, "Country"],
    }),

    updateCountry: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Countries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Country", id },
        { type: "Country", id: "LIST" },
        "Country",
      ],
    }),

    deleteCountry: builder.mutation({
      query: (id) => ({
        url: `Countries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Country", id: "LIST" }, "Country"],
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
