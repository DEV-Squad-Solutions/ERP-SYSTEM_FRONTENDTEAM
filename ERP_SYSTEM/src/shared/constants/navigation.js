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

const FULL_ACCESS_ROLES = ["Admin", "Accountant"];

const LIMITED_ACCESS_ROLES = ["User", "Cashier"];

const INVOICE_ROLES = ["Admin", "Accountant", "User", "Cashier"];

const TREASURY_ROLES = ["Admin", "Accountant", "User", "Cashier"];

const EXPENSE_ROLES = ["Admin", "Accountant", "User", "Cashier"];

const PAYROLL_ROLES = ["Admin", "Accountant", "User", "Cashier"];

export const navigationItems = [
  {
    label: "الرئيسية",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
    roles: ["Admin", "Accountant", "User", "Cashier"],
  },

  {
    type: "section",
    label: "التشغيل",
    roles: ["Admin", "Accountant", "User", "Cashier"],
  },

  {
    label: "المبيعات والمشتريات",
    path: "/dashboard/sales",
    icon: ShoppingCart,
    end: true,
    roles: INVOICE_ROLES,
  },

  {
    label: "العملاء والموردين",
    icon: Users,
    roles: FULL_ACCESS_ROLES,
    children: [
      {
        label: "قائمة العملاء والموردين",
        path: "/dashboard/partners",
        icon: Users,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "كشف حساب عميل/مورد",
        path: "/dashboard/partners/statement",
        icon: FileText,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "أرصدة افتتاحية",
        path: "/dashboard/partners/opening-balances",
        icon: History,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "الدول",
        path: "/dashboard/partners/countries",
        icon: Globe,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
    ],
  },

  {
    label: "المخازن",
    icon: Boxes,
    roles: FULL_ACCESS_ROLES,
    children: [
      {
        label: "قائمة المخازن",
        path: "/dashboard/stores",
        icon: Building,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "التحويلات المخزنية",
        path: "/dashboard/inventory/stock-transfers",
        icon: ArrowLeftRight,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "تسويات المخزون",
        path: "/dashboard/inventory/adjustments",
        icon: SlidersHorizontal,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "أرصدة افتتاحية مخزنية",
        path: "/dashboard/inventory/opening-balances",
        icon: History,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "العبوات",
        path: "/dashboard/inventory/containers",
        icon: PackageOpen,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "وحدات القياس",
        path: "/dashboard/inventory/units",
        icon: Ruler,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
    ],
  },

  {
    label: "السائقين",
    icon: Truck,
    roles: FULL_ACCESS_ROLES,
    children: [
      {
        label: "قائمة السائقين",
        path: "/dashboard/drivers",
        icon: Van,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "كشف حساب سائق",
        path: "/dashboard/drivers/statement",
        icon: FileText,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "مصاريف الرحلات",
        path: "/dashboard/drivers/trip-costs",
        icon: Receipt,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
    ],
  },

  {
    type: "section",
    label: "المالية",
    roles: ["Admin", "Accountant", "User", "Cashier"],
  },

  {
    label: "الخزائن والبنوك",
    icon: Wallet,
    roles: TREASURY_ROLES,
    children: [
      {
        label: "الخزائن والبنوك",
        path: "/dashboard/treasury",
        icon: Wallet,
        end: true,
        roles: TREASURY_ROLES,
      },
      {
        label: "التحويلات بين الخزائن",
        path: "/dashboard/treasury/transfers",
        icon: ArrowLeftRight,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "أنواع حركات الخزنة",
        path: "/dashboard/treasury/cash-movement-types",
        icon: SlidersHorizontal,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "العملات وأسعار الصرف",
        path: "/dashboard/treasury/currencies",
        icon: Coins,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
    ],
  },

  {
    label: "المصاريف",
    path: "/dashboard/expenses",
    icon: Receipt,
    end: true,
    roles: EXPENSE_ROLES,
  },

  {
    type: "section",
    label: "الموارد البشرية",
    roles: PAYROLL_ROLES,
  },

  {
    label: "الأجور والمرتبات",
    icon: DollarSign,
    roles: PAYROLL_ROLES,
    children: [
      {
        label: "لوحة التحكم",
        path: "/dashboard/payroll",
        icon: LayoutDashboard,
        end: true,
        roles: PAYROLL_ROLES,
      },
      {
        label: "الموظفين",
        path: "/dashboard/payroll/employees",
        icon: Users,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "كشف حساب موظف",
        path: "/dashboard/payroll/employees/statement",
        icon: FileText,
        end: true,
        roles: PAYROLL_ROLES,
      },
      {
        label: "الأرصدة الافتتاحية",
        path: "/dashboard/payroll/opening-balances",
        icon: History,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "الحضور والانصراف",
        path: "/dashboard/payroll/attendance/records",
        icon: CalendarRange,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "الحركات المالية للموظفين",
        path: "/dashboard/payroll/movements",
        icon: ArrowRightLeft,
        end: true,
        roles: FULL_ACCESS_ROLES,
      },
      {
        label: "المرتبات",
        path: "/dashboard/payroll/salaries",
        icon: WalletCards,
        end: true,
        roles: PAYROLL_ROLES,
      },
      {
        label: "تقارير المرتبات",
        path: "/dashboard/payroll/reports",
        icon: FileBarChart,
        end: true,
        roles: PAYROLL_ROLES,
      },
    ],
  },

  {
    type: "section",
    label: "المحاسبة",
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "السنوات المالية",
    path: "/dashboard/fiscal-years",
    icon: CalendarRange,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "دليل الحسابات",
    path: "/dashboard/accounts",
    icon: ListTree,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "إعدادات الربط المحاسبي",
    path: "/dashboard/account-mappings",
    icon: Link2,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "قيود اليومية",
    path: "/dashboard/journal-entries",
    icon: BookOpen,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "ميزان المراجعة قبل التسوية",
    path: "/dashboard/trial-balance/before-adjustments",
    icon: ClipboardList,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "ميزان المراجعة بعد التسوية",
    path: "/dashboard/trial-balance/after-adjustments",
    icon: Scale,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "تشكيل القوائم المالية",
    path: "/dashboard/financial-statements",
    icon: ListTree,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "قائمة الدخل",
    path: "/dashboard/income",
    icon: ChartNoAxesCombined,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "المركز المالي",
    path: "/dashboard/financial-position",
    icon: PieChart,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "قائمة التدفقات النقدية",
    path: "/dashboard/cash-flow",
    icon: Waves,
    end: true,
    roles: FULL_ACCESS_ROLES,
  },

  {
    type: "section",
    label: "التقارير",
    roles: FULL_ACCESS_ROLES,
  },

  {
    label: "التقارير",
    icon: FileBarChart,
    roles: FULL_ACCESS_ROLES,
    children: [
      {
        label: "تقارير الربحية",
        icon: TrendingUp,
        roles: FULL_ACCESS_ROLES,
        children: [
          {
            label: "ربحية الفواتير",
            path: "/dashboard/reports/profitability/invoices",
            icon: Receipt,
            end: true,
            roles: FULL_ACCESS_ROLES,
          },
          {
            label: "ربحية الأصناف",
            path: "/dashboard/reports/profitability/items",
            icon: Boxes,
            end: true,
            roles: FULL_ACCESS_ROLES,
          },
        ],
      },
    ],
  },

  {
    type: "section",
    label: "الإدارة",
    roles: ["Admin"],
  },

  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: ShieldCheck,
    end: true,
    roles: ["Admin"],
  },
];
