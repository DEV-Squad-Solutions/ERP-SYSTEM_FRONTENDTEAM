import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./baseQueryWithReauth";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    // ==================== Auth / Administration ====================

    "Company",
    "User",

    // ==================== Partners ====================

    "Party",
    "PartyStatement",
    "Statement",
    "PartnerItemMovements",
    "PartnerOpeningBalance",

    // ==================== Drivers ====================

    "Driver",
    "DriverStatement",
    "DriverTripCost",

    // ==================== Items ====================

    "Item",
    "ItemUnit",
    "PackagingUnit",
    "ItemsCategory",

    // ==================== Inventory / Stores ====================

    "Inventory",
    "Store",
    "StoreContainer",
    "ContainerStore",
    "StoreStockReport",
    "InventoryCostReport",
    "StockTransfer",
    "StockAdjustment",
    "StockOpeningBalance",
    "InventoryCount",

    // ==================== Containers ====================

    "Container",

    // ==================== Invoices ====================

    "Invoice",
    "Sale",
    "Purchase",
    "SaleReturn",
    "PurchaseReturn",
    "InvoiceAuditLog",
    "InvoicePackaging",

    // ==================== Cashboxes ====================

    "Cashbox",
    "CashMovementType",
    "CashVoucher",
    "CashboxTransfer",

    // ==================== Banking ====================

    "Bank",

    // ==================== Countries / Exchange ====================

    "Country",
    "ExchangeRate",

    // ==================== Accounting ====================

    "JournalEntry",
    "Treasury",
    "Expense",
    "Asset",
  ],

  endpoints: () => ({}),
});
