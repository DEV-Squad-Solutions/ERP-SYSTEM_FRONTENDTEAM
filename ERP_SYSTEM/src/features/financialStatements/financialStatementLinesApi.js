import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const financialStatementLinesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialStatementLines: builder.query({
      query: (params = {}) => ({
        url: "/FinancialStatementLines",
        method: "GET",
        params,
      }),
      providesTags: ["FinancialStatementLine"],
    }),

    getFinancialStatementLinesTree: builder.query({
      query: (params = {}) => ({
        url: "/FinancialStatementLines/tree",
        method: "GET",
        params,
      }),
      providesTags: ["FinancialStatementLine"],
    }),

    getFinancialStatementLinesSelect: builder.query({
      query: (params = {}) => ({
        url: "/FinancialStatementLines/select",
        method: "GET",
        params,
      }),
      providesTags: ["FinancialStatementLine"],
    }),

    getFinancialStatementLineById: builder.query({
      query: (id) => ({ url: `/FinancialStatementLines/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [
        { type: "FinancialStatementLine", id },
      ],
    }),

    createFinancialStatementLine: builder.mutation({
      query: (body) => ({
        url: "/FinancialStatementLines",
        method: "POST",
        body,
      }),
      invalidatesTags: tagsFor("FinancialStatementLine"),
    }),

    updateFinancialStatementLine: builder.mutation({
      query: ({ id, body }) => ({
        url: `/FinancialStatementLines/${id}`,
        method: "PUT",
        body: {
          fiscalYearId: body.fiscalYearId,
          statementType: body.statementType,
          code: body.code,
          name: body.name,
          parentLineId: body.parentLineId,
          displayOrder: body.displayOrder,
          isAssignable: body.isAssignable,
          isActive: body.isActive,
          rowVersion: body.rowVersion,
        },
      }),
      invalidatesTags: tagsFor("FinancialStatementLine"),
    }),

    deleteFinancialStatementLine: builder.mutation({
      query: (id) => ({
        url: `/FinancialStatementLines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("FinancialStatementLine"),
    }),
  }),
});

export const {
  useGetFinancialStatementLinesQuery,
  useGetFinancialStatementLinesTreeQuery,
  useGetFinancialStatementLinesSelectQuery,
  useGetFinancialStatementLineByIdQuery,
  useCreateFinancialStatementLineMutation,
  useUpdateFinancialStatementLineMutation,
  useDeleteFinancialStatementLineMutation,
} = financialStatementLinesApi;
