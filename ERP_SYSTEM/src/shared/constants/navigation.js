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
  { label: "الخزائن/البنك", path: "/dashboard/treasury", icon: Wallet },
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
  { label: " الأجور -المرتبات", path: "/dashboard/assets", icon: Building },
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
  { label: "التقارير", path: "/dashboard/reports", icon: FileBarChart },
  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: PersonStandingIcon,
  },
];
