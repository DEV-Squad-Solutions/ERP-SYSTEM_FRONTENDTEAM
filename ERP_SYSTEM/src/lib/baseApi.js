import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./baseQueryWithReauth";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    // Auth / Users / Companies
    "Company",
    "User",

    // Partners
    "Party",
    "PartyStatement",
    "Statement",
    "PartnerItemMovements",
    "PartnerOpeningBalance",

    // Drivers
    "Driver",
    "DriverStatement",
    "DriverTripCost",

    // Items / Inventory
    "Item",
    "ItemUnit",
    "PackagingUnit",
    "ItemsCategory",
    "Inventory",

    // Stores
    "Store",
    "StoreContainer",
    "ContainerStore",
    "StoreStockReport",
    "InventoryCostReport",
    "StockTransfer",
    "StockAdjustment",
    "StockOpeningBalance",

    // Containers
    "Container",

    // Invoices
    "Sale",
    "Purchase",
    "Invoice",
    "InvoiceAuditLog",
    "InvoicePackaging",

    // Cashboxes
    "Cashbox",
    "CashMovementType",
    "CashVoucher",
    "CashboxTransfer",
    // Countries
    "Country",

    // Existing tags from your baseApi
    "Bank",
    "JournalEntry",
    "Treasury",
    "Expense",
    "Asset",
  ],

  endpoints: () => ({}),
});
