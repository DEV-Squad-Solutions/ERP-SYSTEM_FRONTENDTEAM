import { baseApi } from "../../lib/baseApi";

export const statementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerStatement: builder.query({
      query: (params) => ({ url: "Statements/partner", params }),
      providesTags: (result, error, params) => [
        { type: "Statement", id: params.BusinessPartnerId },
      ],
    }),

    getPartnerItemMovements: builder.query({
      query: ({ businessPartnerId, itemId, countryId, fromDate, toDate }) => ({
        url: "/BusinessPartners/item-report",
        method: "GET",
        params: {
          businessPartnerId,
          itemId,
          countryId: countryId || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      }),
      providesTags: ["PartnerItemMovements"],
    }),

    getOperationalTrialBalance: builder.query({
      query: ({
        fromDate,
        toDate,
        AdjustmentView,
        viewMode = "Summary",
        category,
        includeZeroBalances,
      } = {}) => ({
        url: "Statements/operational-trial-balance",
        params: {
          AdjustmentView: AdjustmentView || undefined,
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
          ViewMode: viewMode || undefined,
          Category: category || undefined,
          IncludeZeroBalances: includeZeroBalances ?? undefined,
        },
      }),
      providesTags: ["OperationalTrialBalance"],
    }),

    getIncomeStatement: builder.query({
      query: ({
        fromDate,
        toDate,
        fiscalYearId,
        viewMode = "Summary",
        adjustmentView = "AfterAdjustments",
        includeUnmapped = false,
      } = {}) => ({
        url: "Statements/income-statement",
        method: "GET",
        params: {
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
          FiscalYearId: fiscalYearId || undefined,
          ViewMode: viewMode || undefined,
          AdjustmentView: adjustmentView || undefined,
          IncludeUnmapped: includeUnmapped ?? undefined,
        },
      }),
      providesTags: ["IncomeStatement"],
    }),

    getFinancialPosition: builder.query({
      query: ({
        fromDate,
        toDate,
        fiscalYearId,
        viewMode = "Summary",
        adjustmentView = "AfterAdjustments",
        includeUnmapped = false,
      } = {}) => ({
        url: "Statements/financial-position",
        method: "GET",
        params: {
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
          FiscalYearId: fiscalYearId || undefined,
          ViewMode: viewMode || undefined,
          AdjustmentView: adjustmentView || undefined,
          IncludeUnmapped: includeUnmapped ?? undefined,
        },
      }),
      providesTags: ["FinancialPosition"],
    }),

    getCashFlow: builder.query({
      query: ({
        fromDate,
        toDate,
        fiscalYearId,
        viewMode = "Summary",
        adjustmentView = "AfterAdjustments",
        includeUnmapped = false,
      } = {}) => ({
        url: "Statements/cash-flow",
        method: "GET",
        params: {
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
          FiscalYearId: fiscalYearId || undefined,
          ViewMode: viewMode || undefined,
          AdjustmentView: adjustmentView || undefined,
          IncludeUnmapped: includeUnmapped ?? undefined,
        },
      }),
      providesTags: ["CashFlow"],
    }),
  }),
});

export const {
  useGetPartnerStatementQuery,
  useGetPartnerItemMovementsQuery,
  useGetOperationalTrialBalanceQuery,
  useGetIncomeStatementQuery,
  useGetFinancialPositionQuery,
  useGetCashFlowQuery,
} = statementsApi;
