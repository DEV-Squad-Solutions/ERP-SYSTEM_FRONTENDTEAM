import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const fiscalYearsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFiscalYears: builder.query({
      query: (params) => ({ url: "FiscalYears", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((fy) => ({ type: "FiscalYear", id: fy.id })),
              { type: "FiscalYear", id: "LIST" },
            ]
          : [{ type: "FiscalYear", id: "LIST" }],
    }),

    getFiscalYearsSelect: builder.query({
      query: () => "FiscalYears/select",
      providesTags: [{ type: "FiscalYear", id: "LIST" }],
    }),

    getFiscalYearById: builder.query({
      query: (id) => `FiscalYears/${id}`,
      providesTags: (result, error, id) => [{ type: "FiscalYear", id }],
    }),

    createFiscalYear: builder.mutation({
      query: (data) => ({ url: "FiscalYears", method: "POST", body: data }),
      invalidatesTags: tagsFor("FiscalYear"),
    }),

    updateFiscalYear: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `FiscalYears/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: tagsFor("FiscalYear"),
    }),

    deleteFiscalYear: builder.mutation({
      query: (id) => ({ url: `FiscalYears/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("FiscalYear"),
    }),

    closeFiscalYear: builder.mutation({
      query: (id) => ({ url: `FiscalYears/${id}/close`, method: "POST" }),
      invalidatesTags: tagsFor("FiscalYear"),
    }),

    reopenFiscalYear: builder.mutation({
      query: (id) => ({ url: `FiscalYears/${id}/reopen`, method: "POST" }),
      invalidatesTags: tagsFor("FiscalYear"),
    }),
  }),
});

export const {
  useGetFiscalYearsQuery,
  useGetFiscalYearsSelectQuery,
  useGetFiscalYearByIdQuery,
  useCreateFiscalYearMutation,
  useUpdateFiscalYearMutation,
  useDeleteFiscalYearMutation,
  useCloseFiscalYearMutation,
  useReopenFiscalYearMutation,
} = fiscalYearsApi;
