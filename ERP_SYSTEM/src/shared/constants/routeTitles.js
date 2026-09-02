export const routeTitles = {
  "/dashboard": "الرئيسية",

  "/dashboard/sales": "المبيعات والمشتريات",
  "/dashboard/sales/new": "فاتورة بيع جديدة",
  "/dashboard/sales/:id": "تفاصيل الفاتورة",
  "/dashboard/sales/:id/edit": "تعديل الفاتورة",
  "/dashboard/purchases/new": "فاتورة شراء جديدة",
  "/dashboard/purchases/:id": "تفاصيل فاتورة الشراء",
  "/dashboard/purchases/:id/edit": "تعديل فاتورة الشراء",

  "/dashboard/partners": "قائمة العملاء والموردين",
  "/dashboard/partners/opening-balances": "أرصدة افتتاحية",
  "/dashboard/partners/statement": "كشف حساب عميل/مورد",
  "/dashboard/partners/countries": "الدول",
  "/dashboard/partners/:partnerId": "تفاصيل العميل/المورد",
  "/dashboard/stores/containers/:partnerId": "كشف حساب عبوات",

  "/dashboard/drivers": "قائمة السائقين",
  "/dashboard/drivers/trip-costs": "مصاريف الرحلات",
  "/dashboard/drivers/statement": "كشف حساب سائق",
  "/dashboard/drivers/:driverId": "تفاصيل السائق",

  "/dashboard/treasury": "الخزائن والبنوك",
  "/dashboard/treasury/cash-movement-types": "أنواع حركات الخزنة",
  "/dashboard/treasury/currencies": "العملات وأسعار الصرف",
  "/dashboard/treasury/transfers": "التحويلات بين الخزائن",
  "/dashboard/treasury/transfers/:id": "تفاصيل التحويل",
  "/dashboard/treasury/:cashboxId": "تفاصيل الخزنة",
  "/dashboard/expenses": "المصاريف",
  "/dashboard/bank": "البنك",

  "/dashboard/stores": "قائمة المخازن",
  "/dashboard/stores/:id": "تفاصيل المخزن",
  "/dashboard/inventory/containers": "العبوات",
  "/dashboard/inventory/units": "وحدات القياس",
  "/dashboard/inventory/opening-balances": "أرصدة افتتاحية مخزنية",
  "/dashboard/inventory/stock-transfers": "التحويلات المخزنية",
  "/dashboard/inventory/adjustments": "تسويات المخزون",
  "/dashboard/inventory/adjustments/new": "تسوية مخزون جديدة",
  "/dashboard/inventory/adjustments/:id": "تفاصيل التسوية",
  "/dashboard/inventory/adjustments/:id/edit": "تعديل التسوية",
  "/dashboard/items/:id": "تفاصيل الصنف",
  "/dashboard/invoice-item-pricing": "تكلفة أصناف الفواتير",

  "/dashboard/payroll": "لوحة تحكم الأجور",
  "/dashboard/payroll/employees": "الموظفين",
  "/dashboard/payroll/employees/statement": "كشف حساب موظف",
  "/dashboard/payroll/employees/:employeeId": "تفاصيل الموظف",
  "/dashboard/payroll/opening-balances": "الأرصدة الافتتاحية",
  "/dashboard/payroll/attendance": "تسجيل الحضور والانصراف",
  "/dashboard/payroll/attendance/records": "الحضور والانصراف",
  "/dashboard/payroll/movements": "الحركات المالية للموظفين",
  "/dashboard/payroll/salaries": "المرتبات",
  "/dashboard/payroll/salaries/create": "إنشاء مرتبات",
  "/dashboard/payroll/salaries/:salaryId": "تفاصيل المرتب",
  "/dashboard/payroll/reports": "تقارير المرتبات",

  "/dashboard/fiscal-years": "السنوات المالية",
  "/dashboard/accounts": "دليل الحسابات",
  "/dashboard/statements/operational-trial-balance": "ميزان المراجعة التشغيلي",
  "/dashboard/adjusted-trial-balance": "ميزان بعد التسوية",
  "/dashboard/income": "قائمة الدخل",
  "/dashboard/financial-position": "المركز المالي",

  "/dashboard/reports": "التقارير",
  "/dashboard/reports/profitability/invoices": "ربحية الفواتير",
  "/dashboard/reports/profitability/invoices/:invoiceId":
    "تفاصيل ربحية الفاتورة",
  "/dashboard/reports/profitability/items": "ربحية الأصناف",

  "/dashboard/permissions": "الصلاحيات",
  "/dashboard/profile": "الملف الشخصي",
  "/dashboard/profile/edit": "تعديل الملف الشخصي",
};

export const matchRouteTitle = (pathname) => {
  if (routeTitles[pathname]) return routeTitles[pathname];

  for (const pattern of Object.keys(routeTitles)) {
    if (!pattern.includes(":")) continue;

    const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "[^/]+")}$`);

    if (regex.test(pathname)) return routeTitles[pattern];
  }

  return null;
};
