export const resourceTagsMap = {
  // ==================== الفواتير ====================

  Invoice: [
    "Invoice",
    "Sale",
    "Purchase",
    "SaleReturn",
    "PurchaseReturn",
    "CashVoucher",
    "Cashbox",
    "Inventory",
    "Party",
    "Driver",
  ],

  // ==================== الخزائن ====================

  Cashbox: ["Cashbox"],

  CashboxTransfer: ["Cashbox", "CashboxTransfer"],

  CashMovementType: ["CashMovementType"],

  CashVoucher: ["CashVoucher", "Cashbox", "Party", "Driver"],

  // ==================== المخزون ====================

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
  ],

  InventoryCount: ["Inventory", "StoreStockReport", "InventoryCostReport"],

  // ==================== الأصناف ====================

  Item: ["Item", "Inventory", "InventoryCostReport"],

  ItemUnit: ["ItemUnit", "Item"],

  ItemsCategory: ["ItemsCategory", "Item"],

  // ==================== الشركاء ====================

  BusinessPartner: ["Party", "PartyStatement", "Statement"],

  PartnerOpeningBalance: [
    "PartnerOpeningBalance",
    "PartyStatement",
    "Statement",
  ],

  // ==================== السائقون ====================

  Driver: ["Driver", "DriverStatement", "DriverTripCost"],

  DriverTrip: ["DriverStatement", "DriverTripCost", "Driver"],

  // ==================== البيانات المرجعية ====================

  Country: ["Country"],

  ExchangeRate: ["ExchangeRate"],

  // ==================== الإدارة ====================

  Company: ["Company"],

  ApplicationUser: ["User"],
};
