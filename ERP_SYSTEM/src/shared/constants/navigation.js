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
  CreditCard,
  MinusCircle,
  Clock,
  Timer,
  ArrowLeftRight,
  ChartNoAxesCombined,
} from "lucide-react";

export const navigationItems = [
  // =========================================================
  // الرئيسية
  // =========================================================
  {
    label: "الرئيسية",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },

  // =========================================================
  // التشغيل
  // =========================================================
  {
    type: "section",
    label: "التشغيل",
  },

  {
    label: "المبيعات والمشتريات",
    path: "/dashboard/sales",
    icon: ShoppingCart,
  },

  {
    label: "العملاء والموردين",
    icon: Users,
    children: [
      {
        label: "قائمة العملاء والموردين",
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
    label: "المخازن",
    icon: Boxes,
    children: [
      {
        label: "قائمة المخازن",
        path: "/dashboard/stores",
        icon: Building,
        end: true,
      },
      {
        label: "التحويلات المخزنية",
        path: "/dashboard/inventory/stock-transfers",
        icon: ArrowLeftRight,
      },
      {
        label: "تسويات المخزون",
        path: "/dashboard/inventory/adjustments",
        icon: SlidersHorizontal,
      },
      {
        label: "أرصدة افتتاحية مخزنية",
        path: "/dashboard/inventory/opening-balances",
        icon: History,
      },
      {
        label: "العبوات",
        path: "/dashboard/inventory/containers",
        icon: PackageOpen,
      },
      {
        label: "وحدات القياس",
        path: "/dashboard/inventory/units",
        icon: Ruler,
      },
    ],
  },

  {
    label: "السائقين",
    icon: Truck,
    children: [
      {
        label: "قائمة السائقين",
        path: "/dashboard/drivers",
        icon: Van,
        end: true,
      },
      {
        label: "كشف حساب سائق",
        path: "/dashboard/drivers/statement",
        icon: FileText,
      },
      {
        label: "مصاريف الرحلات",
        path: "/dashboard/drivers/trip-costs",
        icon: Receipt,
      },
    ],
  },

  // =========================================================
  // المالية
  // =========================================================
  {
    type: "section",
    label: "المالية",
  },

  {
    label: "الخزائن والبنوك",
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
    label: "المصاريف",
    path: "/dashboard/expenses",
    icon: Receipt,
  },

  // =========================================================
  // الموارد البشرية
  // =========================================================
  {
    type: "section",
    label: "الموارد البشرية",
  },

  {
    label: "الأجور والمرتبات",
    icon: DollarSign,
    children: [
      // =======================================================
      // Payroll Dashboard
      // =======================================================
      {
        label: "لوحة التحكم",
        path: "/dashboard/payroll",
        icon: LayoutDashboard,
        end: true,
      },

      // =======================================================
      // Employees
      // =======================================================
      {
        label: "الموظفين",
        path: "/dashboard/payroll/employees",
        icon: Users,
      },

      // =======================================================
      // Attendance Taking
      // =======================================================
      {
        label: "تسجيل الحضور",
        path: "/dashboard/payroll/attendance",
        icon: Clock,
        end: true,
      },

      // =======================================================
      // Attendance Records
      // =======================================================
      {
        label: "سجل الحضور والانصراف",
        path: "/dashboard/payroll/attendance/records",
        icon: History,
      },

      // =======================================================
      // Salaries
      // =======================================================
      {
        label: "المرتبات",
        path: "/dashboard/payroll/salaries",
        icon: WalletCards,
      },

      // =======================================================
      // Overtime
      // =======================================================
      {
        label: "الإضافي والبدلات",
        path: "/dashboard/payroll/overtime",
        icon: Timer,
      },

      // =======================================================
      // Deductions
      // =======================================================
      {
        label: "الخصومات",
        path: "/dashboard/payroll/deductions",
        icon: MinusCircle,
      },

      // =======================================================
      // Advances
      // =======================================================
      {
        label: "السلف",
        path: "/dashboard/payroll/advances",
        icon: CreditCard,
      },

      // =======================================================
      // Payroll Reports
      // =======================================================
      {
        label: "تقارير المرتبات",
        path: "/dashboard/payroll/reports",
        icon: FileBarChart,
      },
    ],
  },

  // =========================================================
  // المحاسبة
  // =========================================================
  {
    type: "section",
    label: "المحاسبة",
  },

  {
    label: "قيود اليومية",
    path: "/dashboard/journal-entries",
    icon: BookOpen,
  },

  {
    label: "ميزان المراجعة",
    path: "/dashboard/reconciliation",
    icon: ClipboardList,
  },

  {
    label: "ميزان بعد التسوية",
    path: "/dashboard/adjusted-trial-balance",
    icon: Scale,
  },

  {
    label: "قائمة الدخل",
    path: "/dashboard/income",
    icon: ChartNoAxesCombined,
  },

  {
    label: "المركز المالي",
    path: "/dashboard/financial-position",
    icon: PieChart,
  },

  // =========================================================
  // التقارير
  // =========================================================
  {
    type: "section",
    label: "التقارير",
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

  // =========================================================
  // الإدارة
  // =========================================================
  {
    type: "section",
    label: "الإدارة",
  },

  {
    label: "الصلاحيات",
    path: "/dashboard/permissions",
    icon: ShieldCheck,
  },
];
