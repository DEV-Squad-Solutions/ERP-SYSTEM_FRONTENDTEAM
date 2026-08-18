import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Landmark,
  Boxes,
  Users,
  Truck,
  Receipt,
  Building,
  ClipboardList,
  BookOpen,
  Scale,
  FileBarChart,
  Repeat,
  PieChart,
  PersonStandingIcon,
  WalletCardsIcon,
  DollarSignIcon,
  Van,
  History,
  FileText,
  SlidersHorizontal,
  Ruler,
  PackageOpen,
  Globe,
  CreditCard,
  MinusCircle,
  Clock,
  Timer,
  ArrowLeftRight,
} from "lucide-react";

export const navigationItems = [
  { label: "الرئيسية", path: "/dashboard", icon: LayoutDashboard },
  {
    label: " المبيعات و المشتريات",
    path: "/dashboard/sales",
    icon: TrendingUp,
  },
  {
    label: "العملاء/الموردين",
    icon: Users,
    children: [
      {
        label: "قائمة العملاء/الموردين",
        path: "/dashboard/partners",
        icon: Users,
        end: true,
      },
      {
        label: "كشف حساب عميل/مورد",
        path: "/dashboard/partners/statement",
        icon: FileText,
      },
      {
        label: "أرصدة افتتاحية",
        path: "/dashboard/partners/opening-balances",
        icon: History,
      },
      {
        label: "الدول",
        path: "/dashboard/partners/countries",
        icon: Globe,
      },
    ],
  },
  {
    label: "السائقين",
    icon: Van,
    children: [
      {
        label: "قائمة السائقين",
        path: "/dashboard/drivers",
        icon: Van,
        end: true,
      },
      {
        label: "مصاريف الرحلات",
        path: "/dashboard/drivers/trip-costs",
        icon: Receipt,
      },
      {
        label: "كشف حساب سائق",
        path: "/dashboard/drivers/statement",
        icon: FileText,
      },
    ],
  },
  {
    label: "الخزائن/البنك",
    icon: Wallet,
    children: [
      {
        label: "الخزائن والبنوك",
        path: "/dashboard/treasury",
        icon: Wallet,
        end: true,
      },
      {
        label: "التحويلات بين الخزائن",
        path: "/dashboard/treasury/transfers",
        icon: ArrowLeftRight,
      },
      {
        label: "أنواع حركات الخزنة",
        path: "/dashboard/treasury/cash-movement-types",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "المخازن",
    icon: Boxes,
    children: [
      {
        label: "قائمة المخازن",
        path: "/dashboard/stores",
        icon: Building,
      },
      {
        label: "وحدات القياس",
        path: "/dashboard/inventory/units",
        icon: Ruler,
      },
      {
        label: "العبوات",
        path: "/dashboard/inventory/containers",
        icon: PackageOpen,
      },
      {
        label: "أرصدة افتتاحية مخزنية",
        path: "/dashboard/inventory/opening-balances",
        icon: History,
      },
      {
        label: "تسويات مخزون",
        path: "/dashboard/inventory/adjustments",
        icon: SlidersHorizontal,
      },
    ],
  },
  { label: "المصاريف", path: "/dashboard/expenses", icon: Receipt },

  {
    label: "الأجور والمرتبات",
    icon: DollarSignIcon,
    children: [
      {
        label: "لوحة التحكم",
        path: "/dashboard/payroll",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "الموظفين",
        path: "/dashboard/payroll/employees",
        icon: Users,
      },
      {
        label: "المرتبات",
        path: "/dashboard/payroll/salaries",
        icon: WalletCardsIcon,
      },
      {
        label: "الحضور والانصراف",
        path: "/dashboard/payroll/attendance",
        icon: Clock,
      },
      {
        label: "الإضافي والبدلات",
        path: "/dashboard/payroll/overtime",
        icon: Timer,
      },
      {
        label: "الخصومات",
        path: "/dashboard/payroll/deductions",
        icon: MinusCircle,
      },
      {
        label: "السلف",
        path: "/dashboard/payroll/advances",
        icon: CreditCard,
      },
      {
        label: "التقارير",
        path: "/dashboard/payroll/reports",
        icon: FileBarChart,
      },
    ],
  },
  {
    label: " ميزان المراجعة",
    path: "/dashboard/reconciliation",
    icon: ClipboardList,
  },
  { label: "قيود اليومية", path: "/dashboard/journal-entries", icon: BookOpen },
  {
    label: "ميزان بعد التسوية",
    path: "/dashboard/adjusted-trial-balance",
    icon: Scale,
  },
  {
    label: "  الدخل",
    path: "/dashboard/income",
    icon: Repeat,
  },
  {
    label: "تقارير المركز المالي",
    path: "/dashboard/financial-position",
    icon: PieChart,
  },
  {
    label: "التقارير",
    icon: FileBarChart,
    children: [
      {
        label: "تقرير المبيعات والمشتريات",
        path: "/dashboard/reports/sales",
        icon: ShoppingCart,
      },
      {
        label: "تقرير حركة المخزون",
        path: "/dashboard/reports/inventory",
        icon: Boxes,
      },
      {
        label: "تقرير الحسابات",
        path: "/dashboard/reports/accounts",
        icon: FileText,
      },
      {
        label: "تقارير الربحية",
        icon: TrendingUp,
        children: [
          {
            label: "ربحية الفواتير",
            path: "/dashboard/reports/profitability/invoices",
            icon: Receipt,
            end: true,
          },
          {
            label: "ربحية الأصناف",
            path: "/dashboard/reports/profitability/items",
            icon: Boxes,
            end: true,
          },
        ],
      },
    ],
  },
  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: PersonStandingIcon,
  },
];
