// src/features/accounting/api/accountMappingsApi.js
import { baseApi } from "../../lib/baseApi";

export const AccountingMappingType = {
  Cashbox: "Cashbox",
  CashMovementType: "CashMovementType",
  Sales: "Sales",
  Purchase: "Purchase",
  SalesReturn: "SalesReturn",
  PurchaseReturn: "PurchaseReturn",
  Inventory: "Inventory",
  CostOfGoodsSold: "CostOfGoodsSold",
  CustomerControl: "CustomerControl",
  SupplierControl: "SupplierControl",
  EmployeeControl: "EmployeeControl",
  DriverControl: "DriverControl",
  ExchangeGain: "ExchangeGain",
  ExchangeLoss: "ExchangeLoss",
  InventoryAdjustmentGain: "InventoryAdjustmentGain",
  InventoryAdjustmentLoss: "InventoryAdjustmentLoss",
  OpeningBalanceEquity: "OpeningBalanceEquity",
  EmployeeReceivable: "EmployeeReceivable",
  DriverTripExpense: "DriverTripExpense",
};

// mapping types that carry a sourceId (per-cashbox / per-movement-type row)
export const SOURCED_MAPPING_TYPES = new Set([
  AccountingMappingType.Cashbox,
  AccountingMappingType.CashMovementType,
]);

export const accountMappingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountMappings: builder.query({
      // GET /api/v1/AccountMappings?fiscalYearId=
      query: (fiscalYearId) => ({
        url: "/AccountMappings",
        params: { fiscalYearId },
      }),
      providesTags: (result, error, fiscalYearId) => [
        { type: "AccountMappings", id: fiscalYearId },
      ],
    }),

    saveAccountMappings: builder.mutation({
      // PUT /api/v1/AccountMappings?fiscalYearId=  body: { mappings: [{ mappingType, sourceId, accountId }] }
      query: ({ fiscalYearId, mappings }) => ({
        url: "/AccountMappings",
        method: "PUT",
        params: { fiscalYearId },
        body: {
          mappings: mappings.map((m) => ({
            mappingType: m.mappingType,
            // sourceId is required for Cashbox / CashMovementType, omit otherwise
            ...(SOURCED_MAPPING_TYPES.has(m.mappingType)
              ? { sourceId: m.sourceId }
              : {}),
            accountId: m.accountId,
          })),
        },
      }),
      invalidatesTags: (result, error, { fiscalYearId }) => [
        { type: "AccountMappings", id: fiscalYearId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAccountMappingsQuery, useSaveAccountMappingsMutation } =
  accountMappingsApi;
