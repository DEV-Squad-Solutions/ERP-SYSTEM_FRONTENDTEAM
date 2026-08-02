import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
  Users,
  FileText,
  Receipt,
  UserPlus,
  ClipboardList,
  ArrowLeft,
  Clock,
} from "lucide-react";

const stats = [
  {
    label: "إجمالي المبيعات",
    value: 0,
    suffix: "ج.م",
    icon: TrendingUp,
    accent: "text-positive bg-positive/10",
    change: null,
  },
  {
    label: "إجمالي المشتريات",
    value: 0,
    suffix: "ج.م",
    icon: ShoppingCart,
    accent: "text-gold-700 bg-gold-50",
    change: null,
  },
  {
    label: "رصيد الخزينة",
    value: 0,
    suffix: "ج.م",
    icon: Wallet,
    accent: "text-primary-600 bg-primary-50",
    change: null,
  },
  {
    label: "عدد العملاء",
    value: 0,
    suffix: "",
    icon: Users,
    accent: "text-ink-700 bg-ink-900/[0.05]",
    change: null,
  },
];

const quickActions = [
  {
    label: "فاتورة بيع جديدة",
    to: "/dashboard/sales/new",
    icon: FileText,
  },
  {
    label: "فاتورة شراء جديدة",
    to: "/dashboard/purchases/new",
    icon: ShoppingCart,
  },
  {
    label: "سند قبض / صرف",
    to: "/dashboard/treasury",
    icon: Receipt,
  },
  {
    label: "عميل جديد",
    to: "/dashboard/partners",
    icon: UserPlus,
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ar-EG");
}

function StatCard({ label, value, suffix, icon: Icon, accent, change }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>

        {change ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              change > 0
                ? "text-positive bg-positive/10"
                : "text-negative bg-negative/10"
            }`}
          >
            {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </div>

      <p className="mt-4 text-sm text-ink-400">{label}</p>
      <p className="num mt-1 text-2xl font-bold text-ink-900">
        {formatNumber(value)}
        {suffix && (
          <span className="mr-1 text-sm font-medium text-ink-400">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

export default function DashboardHome() {
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">نظرة عامة</h2>
          <p className="mt-1 text-sm text-ink-400">{today}</p>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* آخر الحركات */}
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-400/10 px-5 py-4">
            <h3 className="text-sm font-semibold text-ink-900">آخر الحركات</h3>
            <Link
              to="/dashboard/statements"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600"
            >
              عرض الكل
              <ArrowLeft size={13} />
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-400/5">
              <Clock size={22} className="text-ink-400/60" strokeWidth={1.6} />
            </div>
            <p className="text-sm text-ink-400">لا توجد حركات مسجلة بعد</p>
          </div>
        </div>

        {/* إجراءات سريعة */}
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <div className="border-b border-ink-400/10 px-5 py-4">
            <h3 className="text-sm font-semibold text-ink-900">
              إجراءات سريعة
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-400/10 px-3 py-4 text-center transition-colors hover:border-primary-500/30 hover:bg-primary-50/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <action.icon size={16} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-medium leading-tight text-ink-700">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* شريط مدين / دائن مختصر */}
      <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={16} className="text-ink-400" />
          <h3 className="text-sm font-semibold text-ink-900">ملخص الأرصدة</h3>
        </div>

        <div className="flex overflow-hidden rounded-full bg-ink-400/5">
          <div className="h-2.5 w-1/2 bg-negative/40" />
          <div className="h-2.5 w-1/2 bg-positive/40" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-negative/60" />
            مدين: {formatNumber(0)} ج.م
          </span>
          <span className="flex items-center gap-1.5">
            دائن: {formatNumber(0)} ج.م
            <span className="h-2 w-2 rounded-full bg-positive/60" />
          </span>
        </div>
      </div>
    </div>
  );
}
