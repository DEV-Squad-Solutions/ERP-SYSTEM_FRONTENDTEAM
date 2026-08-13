export const resourceTagsMap = {
  // الفواتير
  Invoice: ["Invoice", "Cashbox"], // ضيف "Sale" أو "Purchase" هنا لو صفحاتهم منفصلة عن Invoice

  // الخزائن
  Cashbox: ["Cashbox"],
  CashboxTransfer: ["Cashbox"], // مفيش tag مخصص لها حاليًا
  CashMovementType: ["CashMovementType"],
  CashVoucher: ["CashVoucher", "Cashbox"],

  // المخزون
  Store: ["Store"],
  StoreContainer: ["StoreContainer", "ContainerStore"], // عندك التاجين، مش واضح الفرق بينهم — راجعهم
  Container: ["Container"],
  StockOpeningBalance: ["StockOpeningBalance", "Inventory", "StoreStockReport"],
  StockAdjustment: ["StockAdjustment", "Inventory", "StoreStockReport"],
  StockTransfer: ["StockTransfer", "Inventory", "StoreStockReport"],
  InventoryCount: ["Inventory", "StoreStockReport", "InventoryCostReport"], // مفيش tag مخصص لها

  // الأصناف
  Item: ["Item"],
  ItemUnit: ["ItemUnit"],
  ItemsCategory: ["ItemsCategory"],

  // الشركاء
  BusinessPartner: ["Party"], // الاسم مختلف عن SignalR
  PartnerOpeningBalance: [
    "PartnerOpeningBalance",
    "PartyStatement",
    "Statement",
  ],

  // السائقون
  Driver: ["Driver"],
  DriverTrip: ["DriverStatement", "DriverTripCost"], // مفيش tag اسمه DriverTrip حاليًا

  // البيانات المرجعية
  Country: ["Country"],
  ExchangeRate: [], // ⚠️ مفيش tag لها خالص — ضيفها في baseApi.js لو محتاج تحديث لحظي لأسعار الصرف

  // الإدارة
  Company: ["Company"],
  ApplicationUser: ["User"], // الاسم مختلف عن SignalR
};
