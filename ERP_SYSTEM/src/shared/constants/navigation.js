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
  Timer,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Coins,
  ArrowRightLeft,
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
        roles: PARTNERS_ROLES,
      },
      {
        label: "أرصدة افتتاحية",
        path: "/dashboard/partners/opening-balances",
        icon: History,
        roles: ["Admin", "CompanyOwner", "Accountant"],
      },
      {
        label: "الدول",
        path: "/dashboard/partners/countries",
        icon: Globe,
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
        roles: INVENTORY_ROLES,
      },
      {
        label: "تسويات المخزون",
        path: "/dashboard/inventory/adjustments",
        icon: SlidersHorizontal,
        roles: ["Admin", "CompanyOwner", "Inventory"],
      },
      {
        label: "أرصدة افتتاحية مخزنية",
        path: "/dashboard/inventory/opening-balances",
        icon: History,
        roles: ["Admin", "CompanyOwner", "Inventory", "Accountant"],
      },
      {
        label: "العبوات",
        path: "/dashboard/inventory/containers",
        icon: PackageOpen,
        roles: INVENTORY_ROLES,
      },
      {
        label: "وحدات القياس",
        path: "/dashboard/inventory/units",
        icon: Ruler,
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
        roles: DRIVER_ROLES,
      },
      {
        label: "مصاريف الرحلات",
        path: "/dashboard/drivers/trip-costs",
        icon: Receipt,
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
        roles: FINANCE_ROLES,
      },
      {
        label: "أنواع حركات الخزنة",
        path: "/dashboard/treasury/cash-movement-types",
        icon: SlidersHorizontal,
        roles: ["Admin", "CompanyOwner", "Accountant"],
      },
      {
        label: "العملات وأسعار الصرف",
        path: "/dashboard/treasury/currencies",
        icon: Coins,
        roles: ["Admin", "CompanyOwner", "Accountant"],
      },
    ],
  },

  {
    label: "المصاريف",
    path: "/dashboard/expenses",
    icon: Receipt,
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
        roles: HR_ROLES,
      },
      {
        label: "كشف حساب موظف",
        path: "/dashboard/payroll/employees/statement",
        icon: FileText,
        roles: HR_ROLES,
      },
      {
        label: "الأرصدة الافتتاحية",
        path: "/dashboard/payroll/opening-balances",
        icon: History,
        roles: ["Admin", "CompanyOwner", "HR", "Accountant"],
      },
      {
        label: "الحضور والانصراف",
        path: "/dashboard/payroll/attendance/records",
        icon: History,
        roles: HR_ROLES,
      },
      {
        label: "المرتبات",
        path: "/dashboard/payroll/salaries",
        icon: WalletCards,
        roles: HR_ROLES,
      },

      {
        label: "الحركات المالية الموظفين",
        path: "/dashboard/payroll/movements",
        icon: ArrowRightLeft,
        roles: HR_ROLES,
      },
      {
        label: "تقارير المرتبات",
        path: "/dashboard/payroll/reports",
        icon: FileBarChart,
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
    label: "قيود اليومية",
    path: "/dashboard/journal-entries",
    icon: BookOpen,
    roles: ACCOUNTING_ROLES,
  },

  {
    label: "ميزان المراجعة التشغيلي",
    path: "/dashboard/statements/operational-trial-balance",
    icon: ClipboardList,
    roles: ACCOUNTING_ROLES,
  },

  {
    label: "ميزان بعد التسوية",
    path: "/dashboard/adjusted-trial-balance",
    icon: Scale,
    roles: ACCOUNTING_ROLES,
  },

  {
    label: "قائمة الدخل",
    path: "/dashboard/income",
    icon: ChartNoAxesCombined,
    roles: ACCOUNTING_ROLES,
  },

  {
    label: "المركز المالي",
    path: "/dashboard/financial-position",
    icon: PieChart,
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
        label: "تقرير المبيعات والمشتريات",
        path: "/dashboard/reports/sales",
        icon: ShoppingCart,
        roles: ["Admin", "CompanyOwner", "Accountant", "Sales"],
      },
      {
        label: "تقرير حركة المخزون",
        path: "/dashboard/reports/inventory",
        icon: Boxes,
        roles: ["Admin", "CompanyOwner", "Accountant", "Inventory"],
      },
      {
        label: "تقرير الحسابات",
        path: "/dashboard/reports/accounts",
        icon: FileText,
        roles: ACCOUNTING_ROLES,
      },
      {
        label: "تكلفة أصناف الفواتير",
        path: "/dashboard/invoice-item-pricing",
        icon: Wallet,
        roles: ["Admin", "CompanyOwner", "Accountant", "Inventory"],
      },
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
    roles: ["Admin", "CompanyOwner"],
  },

  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: ShieldCheck,
    roles: ["Admin", "CompanyOwner"],
  },
];
