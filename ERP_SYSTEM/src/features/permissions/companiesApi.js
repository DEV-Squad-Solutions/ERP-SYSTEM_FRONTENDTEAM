import { baseApi } from "../../lib/baseApi";

export const STOCK_BALANCE_CHECK_MODES = [
  { value: "None", label: "بدون فحص" },
  { value: "DateCheck", label: "فحص بالتاريخ" },
  { value: "FinalCheck", label: "فحص نهائي" },
  { value: "Both", label: "الاثنين معًا" },
];

export const CURRENCY_CODES = [
  { value: "EGP", label: "جنيه مصري (EGP)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" },
  { value: "GBP", label: "جنيه إسترليني (GBP)" },
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "KWD", label: "دينار كويتي (KWD)" },
];

export const companiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: (params) => ({
        url: "/Companies",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result?.items)
          ? [
              ...result.items.map(({ id }) => ({ type: "Company", id })),
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),

    getCompaniesForSelect: builder.query({
      query: () => "/Companies/select",
      transformResponse: (response) =>
        Array.isArray(response)
          ? response
          : (response?.data ?? response?.items ?? []),
    }),

    getCompanyById: builder.query({
      query: (id) => `/Companies/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Company", id }],
    }),

    createCompany: builder.mutation({
      query: (body) => ({
        url: "/Companies",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Company", id: "LIST" }],
    }),

    updateCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Companies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Company", id },
        { type: "Company", id: "LIST" },
      ],
    }),

    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/Companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Company", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCompaniesQuery,
  useGetCompaniesForSelectQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi;
