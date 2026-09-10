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

    // ==================== Employees / Payroll (كانت ناقصة بالكامل) ====================
    "Employee",
    "Attendance",
    "EmployeeMovement",
    "PayrollEntry",
    "EmployeeOpeningBalance",
    "EmployeeStatement",

    // ==================== Items ====================
    "Item",
    "ItemUnit",
    "PackagingUnit",
    "ItemsCategory",
    "ItemBalance",

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
    "CashVoucherPartySelect",

    // ==================== Banking ====================
    "Bank",

    // ==================== Countries / Exchange ====================
    "Country",
    "ExchangeRate",
    "CurrenciesSelect",

    // ==================== Accounting (كانت ناقصة بالكامل) ====================
    "JournalEntry",
    "Account",
    "AccountMappings",
    "FiscalYear",
    "FinancialStatementLine",
    "Treasury",
    "Expense",
    "Asset",

    // ==================== Reports (كانت ناقصة بالكامل) ====================
    "Dashboard",
    "OperationalTrialBalance",
    "IncomeStatement",
    "FinancialPosition",
    "CashFlow",
  ],

  endpoints: () => ({}),
});
