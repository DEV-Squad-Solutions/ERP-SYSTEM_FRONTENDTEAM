import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Boxes,
  Users,
  Truck,
  Receipt,
  Building,
  ClipboardList,
  BookOpen,
  Scale,
  FileBarChart,
  PieChart,
  ShieldCheck,
  WalletCards,
  DollarSign,
  Van,
  History,
  FileText,
  SlidersHorizontal,
  Ruler,
  PackageOpen,
  Globe,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Coins,
  ArrowRightLeft,
  CalendarRange,
  ListTree,
  Link2,
  Waves,
} from "lucide-react";

const ALL_ROLES = [
  "Admin",
  "CompanyOwner",
  "Sales",
  "Accountant",
  "Inventory",
  "HR",
  "Driver",
];

const SALES_ROLES = ["Admin", "CompanyOwner", "Sales", "Accountant"];

const PARTNERS_ROLES = ["Admin", "CompanyOwner", "Sales", "Accountant"];

const INVENTORY_ROLES = [
  "Admin",
  "CompanyOwner",
  "Inventory",
  "Sales",
  "Accountant",
];

const DRIVER_ROLES = ["Admin", "CompanyOwner", "Driver", "Accountant"];

const FINANCE_ROLES = ["Admin", "CompanyOwner", "Accountant"];

const HR_ROLES = ["Admin", "CompanyOwner", "HR", "Accountant"];

const ACCOUNTING_ROLES = ["Admin", "CompanyOwner", "Accountant"];

const REPORT_ROLES = [
  "Admin",
  "CompanyOwner",
  "Accountant",
  "Sales",
  "Inventory",
  "HR",
];

const ADMIN_ROLES = ["Admin", "CompanyOwner"];

export const navigationItems = [
  {
    label: "الرئيسية",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
    roles: ALL_ROLES,
  },

  {
    type: "section",
    label: "التشغيل",
    roles: ALL_ROLES,
  },

  {
    label: "المبيعات والمشتريات",
    path: "/dashboard/sales",
    icon: ShoppingCart,
    end: true,
    roles: SALES_ROLES,
  },

  {
    label: "العملاء والموردين",
    icon: Users,
    roles: PARTNERS_ROLES,
    children: [
      {
        label: "قائمة العملاء والموردين",
        path: "/dashboard/partners",
        icon: Users,
        end: true,
        roles: PARTNERS_ROLES,
      },
      {
        label: "كشف حساب عميل/مورد",
        path: "/dashboard/partners/statement",
        icon: FileText,
        end: true,
        roles: PARTNERS_ROLES,
      },
      {
        label: "أرصدة افتتاحية",
        path: "/dashboard/partners/opening-balances",
        icon: History,
        end: true,
        roles: ACCOUNTING_ROLES,
      },
      {
        label: "الدول",
        path: "/dashboard/partners/countries",
        icon: Globe,
        end: true,
        roles: ["Admin", "CompanyOwner", "Sales", "Accountant"],
      },
    ],
  },

  {
    label: "المخازن",
    icon: Boxes,
    roles: INVENTORY_ROLES,
    children: [
      {
        label: "قائمة المخازن",
        path: "/dashboard/stores",
        icon: Building,
        end: true,
        roles: INVENTORY_ROLES,
      },
      {
        label: "التحويلات المخزنية",
        path: "/dashboard/inventory/stock-transfers",
        icon: ArrowLeftRight,
        end: true,
        roles: INVENTORY_ROLES,
      },
      {
        label: "تسويات المخزون",
        path: "/dashboard/inventory/adjustments",
        icon: SlidersHorizontal,
        end: true,
        roles: ["Admin", "CompanyOwner", "Inventory"],
      },
      {
        label: "أرصدة افتتاحية مخزنية",
        path: "/dashboard/inventory/opening-balances",
        icon: History,
        end: true,
        roles: ["Admin", "CompanyOwner", "Inventory", "Accountant"],
      },
      {
        label: "العبوات",
        path: "/dashboard/inventory/containers",
        icon: PackageOpen,
        end: true,
        roles: INVENTORY_ROLES,
      },
      {
        label: "وحدات القياس",
        path: "/dashboard/inventory/units",
        icon: Ruler,
        end: true,
        roles: INVENTORY_ROLES,
      },
    ],
  },

  {
    label: "السائقين",
    icon: Truck,
    roles: DRIVER_ROLES,
    children: [
      {
        label: "قائمة السائقين",
        path: "/dashboard/drivers",
        icon: Van,
        end: true,
        roles: DRIVER_ROLES,
      },
      {
        label: "كشف حساب سائق",
        path: "/dashboard/drivers/statement",
        icon: FileText,
        end: true,
        roles: DRIVER_ROLES,
      },
      {
        label: "مصاريف الرحلات",
        path: "/dashboard/drivers/trip-costs",
        icon: Receipt,
        end: true,
        roles: DRIVER_ROLES,
      },
    ],
  },

  {
    type: "section",
    label: "المالية",
    roles: FINANCE_ROLES,
  },

  {
    label: "الخزائن والبنوك",
    icon: Wallet,
    roles: FINANCE_ROLES,
    children: [
      {
        label: "الخزائن والبنوك",
        path: "/dashboard/treasury",
        icon: Wallet,
        end: true,
        roles: FINANCE_ROLES,
      },
      {
        label: "التحويلات بين الخزائن",
        path: "/dashboard/treasury/transfers",
        icon: ArrowLeftRight,
        end: true,
        roles: FINANCE_ROLES,
      },
      {
        label: "أنواع حركات الخزنة",
        path: "/dashboard/treasury/cash-movement-types",
        icon: SlidersHorizontal,
        end: true,
        roles: FINANCE_ROLES,
      },
      {
        label: "العملات وأسعار الصرف",
        path: "/dashboard/treasury/currencies",
        icon: Coins,
        end: true,
        roles: FINANCE_ROLES,
      },
    ],
  },

  {
    label: "المصاريف",
    path: "/dashboard/expenses",
    icon: Receipt,
    end: true,
    roles: FINANCE_ROLES,
  },

  {
    type: "section",
    label: "الموارد البشرية",
    roles: HR_ROLES,
  },

  {
    label: "الأجور والمرتبات",
    icon: DollarSign,
    roles: HR_ROLES,
    children: [
      {
        label: "لوحة التحكم",
        path: "/dashboard/payroll",
        icon: LayoutDashboard,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "الموظفين",
        path: "/dashboard/payroll/employees",
        icon: Users,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "كشف حساب موظف",
        path: "/dashboard/payroll/employees/statement",
        icon: FileText,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "الأرصدة الافتتاحية",
        path: "/dashboard/payroll/opening-balances",
        icon: History,
        end: true,
        roles: ["Admin", "CompanyOwner", "HR", "Accountant"],
      },
      {
        label: "الحضور والانصراف",
        path: "/dashboard/payroll/attendance/records",
        icon: CalendarRange,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "الحركات المالية للموظفين",
        path: "/dashboard/payroll/movements",
        icon: ArrowRightLeft,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "المرتبات",
        path: "/dashboard/payroll/salaries",
        icon: WalletCards,
        end: true,
        roles: HR_ROLES,
      },
      {
        label: "تقارير المرتبات",
        path: "/dashboard/payroll/reports",
        icon: FileBarChart,
        end: true,
        roles: HR_ROLES,
      },
    ],
  },

  {
    type: "section",
    label: "المحاسبة",
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "السنوات المالية",
    path: "/dashboard/fiscal-years",
    icon: CalendarRange,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "دليل الحسابات",
    path: "/dashboard/accounts",
    icon: ListTree,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "إعدادات الربط المحاسبي",
    path: "/dashboard/account-mappings",
    icon: Link2,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "قيود اليومية",
    path: "/dashboard/journal-entries",
    icon: BookOpen,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "ميزان المراجعة قبل التسوية",
    path: "/dashboard/trial-balance/before-adjustments",
    icon: ClipboardList,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "ميزان المراجعة بعد التسوية",
    path: "/dashboard/trial-balance/after-adjustments",
    icon: Scale,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "تشكيل القوائم المالية",
    path: "/dashboard/financial-statements",
    icon: ListTree,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "قائمة الدخل",
    path: "/dashboard/income",
    icon: ChartNoAxesCombined,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "المركز المالي",
    path: "/dashboard/financial-position",
    icon: PieChart,
    end: true,
    roles: ACCOUNTING_ROLES,
  },
  {
    label: "قائمة التدفقات النقدية",
    path: "/dashboard/cash-flow",
    icon: Waves,
    end: true,
    roles: ACCOUNTING_ROLES,
  },

  {
    type: "section",
    label: "التقارير",
    roles: REPORT_ROLES,
  },

  {
    label: "التقارير",
    icon: FileBarChart,
    roles: REPORT_ROLES,
    children: [
      {
        label: "تقارير الربحية",
        icon: TrendingUp,
        roles: ["Admin", "CompanyOwner", "Accountant"],
        children: [
          {
            label: "ربحية الفواتير",
            path: "/dashboard/reports/profitability/invoices",
            icon: Receipt,
            end: true,
            roles: ["Admin", "CompanyOwner", "Accountant"],
          },
          {
            label: "ربحية الأصناف",
            path: "/dashboard/reports/profitability/items",
            icon: Boxes,
            end: true,
            roles: ["Admin", "CompanyOwner", "Accountant", "Inventory"],
          },
        ],
      },
    ],
  },

  {
    type: "section",
    label: "الإدارة",
    roles: ADMIN_ROLES,
  },

  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: ShieldCheck,
    end: true,
    roles: ADMIN_ROLES,
  },
];
