/**
 * resourceTagsMap
 * ================
 * مصدر واحد لعلاقات كل موديول بالـ tags اللي المفروض تتعمل لها invalidate
 * لما الموديول ده يتغيّر (create / update / delete / أي mutation).
 *
 * القاعدة الوحيدة: أي علاقة جديدة بين موديولين، تتضاف هنا مرة واحدة بس.
 * أي endpoint بيستخدم tagsFor() من ./invalidation.js هياخدها تلقائي —
 * من غير ما تفتح كل ملف API وتعدّله واحد واحد.
 */
export const resourceTagsMap = {
  // ==================== Auth / Administration ====================
  Company: ["Company"],
  User: ["User"],

  // ==================== Partners ====================
  Party: [
    "Party",
    "PartyStatement",
    "Statement",
    "ContainerStore",
    "CashVoucherPartySelect",
  ],
  PartnerOpeningBalance: [
    "PartnerOpeningBalance",
    "PartyStatement",
    "Statement",
  ],

  // ==================== Drivers ====================
  Driver: [
    "Driver",
    "DriverStatement",
    "DriverTripCost",
    "CashVoucherPartySelect",
  ],
  DriverTrip: ["DriverStatement", "DriverTripCost", "Driver"],

  // ==================== Employees / Payroll ====================
  Employee: ["Employee", "EmployeeStatement", "CashVoucherPartySelect"],
  Attendance: ["Attendance"],
  EmployeeMovement: [
    "EmployeeMovement",
    "Cashbox",
    "Statement",
    "EmployeeStatement",
  ],
  PayrollEntry: ["PayrollEntry", "Cashbox", "Statement", "EmployeeStatement"],
  EmployeeOpeningBalance: ["EmployeeOpeningBalance", "EmployeeStatement"],

  // ==================== Items / Inventory ====================
  Item: ["Item", "Inventory", "InventoryCostReport", "ItemBalance"],
  Store: ["Store", "Inventory", "StoreStockReport"],
  StoreContainer: ["StoreContainer", "ContainerStore", "Inventory"],
  Container: ["Container", "Inventory"],
  StockOpeningBalance: [
    "StockOpeningBalance",
    "Inventory",
    "StoreStockReport",
    "InventoryCostReport",
  ],
  StockAdjustment: [
    "StockAdjustment",
    "Inventory",
    "StoreStockReport",
    "InventoryCostReport",
  ],
  StockTransfer: [
    "StockTransfer",
    "Inventory",
    "StoreStockReport",
    "InventoryCostReport",
    "Store",
  ],
  InventoryCount: [
    "InventoryCount",
    "Inventory",
    "StoreStockReport",
    "InventoryCostReport",
  ],
  ItemBalance: ["ItemBalance", "Inventory"],

  // ==================== Invoices ====================
  Invoice: [
    "Invoice",
    "Sale",
    "Purchase",
    "SaleReturn",
    "PurchaseReturn",
    "Inventory",
    "StoreStockReport",
    "InventoryCostReport",
    "ItemBalance",
    "Cashbox",
    "CashVoucher",
    "Party",
    "PartyStatement",
    "Statement",
    "Driver",
    "DriverStatement",
    "DriverTripCost",
  ],

  // ==================== Cashboxes ====================
  Cashbox: ["Cashbox"],
  CashboxTransfer: ["CashboxTransfer", "Cashbox"],
  CashMovementType: ["CashMovementType", "CashVoucherPartySelect"],
  CashVoucher: [
    "CashVoucher",
    "Cashbox",
    "Party",
    "PartyStatement",
    "Statement",
    "Driver",
    "DriverStatement",
    "DriverTripCost",
    "EmployeeStatement",
    "CashVoucherPartySelect",
  ],

  // ==================== Reference Data ====================
  Country: ["Country"],
  ExchangeRate: ["ExchangeRate", "CashVoucher", "Statement", "Cashbox"],
  CurrenciesSelect: ["CurrenciesSelect"],

  // ==================== Accounting ====================
  Account: ["Account"],
  AccountMappings: ["AccountMappings"],
  FiscalYear: ["FiscalYear"],
  FinancialStatementLine: ["FinancialStatementLine"],
  JournalEntry: ["JournalEntry"],

  // ==================== Reports ====================
  Dashboard: ["Dashboard"],
  OperationalTrialBalance: ["OperationalTrialBalance"],
  IncomeStatement: ["IncomeStatement"],
  FinancialPosition: ["FinancialPosition"],
  CashFlow: ["CashFlow"],
};
