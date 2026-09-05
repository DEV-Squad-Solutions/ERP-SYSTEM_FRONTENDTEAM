import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import {
  FilePlus2,
  FileMinus2,
  ArrowLeftRight,
  Boxes,
  BookOpen,
  TrendingUp,
  Wallet,
  Package,
  Users,
  Truck,
  Briefcase,
  FileText,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Clock,
  Landmark,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useGetDashboardSummaryQuery } from "../dashboardApi";

/* ------------------------------------------------------------------ */
/* توكنز التصميم — هوية "دفتر أستاذ" (Ledger): تيل داكن كأساس ماليّ    */
/* موثوق + لمسة نحاسية/ذهبية للقيم المالية، بعيدًا عن كليشيه الإندجو  */
/* ------------------------------------------------------------------ */
const TOKENS = {
  primary: "#0f766e", // تيل — الهوية الأساسية
  gold: "#b45309", // نحاسي/ذهبي — كل ما يخص المال والقيمة
  goldSoft: "#f59e0b",
  success: "#0f9d58",
  danger: "#be123c",
  info: "#4338ca",
  muted: "#94a3b8",
};

const MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const getCurrencyLabel = (code) =>
  CURRENCIES.find((c) => c.value === code)?.label ?? code ?? "جنيه مصري";

const fmtMoney = (v, currencyCode = "EGP") =>
  `${(v ?? 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ${getCurrencyLabel(
    currencyCode,
  )}`;

/* حركة دخول واحدة منسّقة للصفحة كلها — تتالي بسيط بدل تكرار
   نفس تأثير fade/slide على كل عنصر لوحده */
const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* عدّاد رقمي متحرك — بيقرأ رقم خام ويشغّل تحويله للنص المطلوب فريم بفريم */
function AnimatedNumber({ value, format }) {
  const [display, setDisplay] = useState(format ? format(0) : 0);

  useEffect(() => {
    const controls = animate(0, value ?? 0, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(format ? format(v) : Math.round(v)),
    });
    return () => controls.stop();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{display}</>;
}

/* أشكال زخرفية خفيفة (دوائر مموّهة) — لحظة بصرية واحدة في الهيدر
   بدل ما تتكرر في كل مكان */
function DecorativeBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute top-1/2 -left-10 h-40 w-40 -translate-y-1/2 rounded-full bg-teal-300/20 blur-2xl" />
    </div>
  );
}

/* -------------------------- إجراءات سريعة -------------------------- */
/* المسارات دي منسوخة حرفيًا من router.jsx بتاع المشروع */
const QUICK_ACTIONS = [
  {
    to: "/dashboard/sales/new",
    label: "فاتورة مبيعات",
    icon: FilePlus2,
    tone: "primary",
  },
  {
    to: "/dashboard/purchases/new",
    label: "فاتورة مشتريات",
    icon: FileMinus2,
    tone: "gold",
  },
  {
    to: "/dashboard/treasury",
    label: "الخزائن",
    icon: Wallet,
    tone: "success",
  },
  {
    to: "/dashboard/treasury/transfers",
    label: "تحويل بين خزائن",
    icon: ArrowLeftRight,
    tone: "primary",
  },
  {
    to: "/dashboard/inventory/adjustments/new",
    label: "تسوية مخزون",
    icon: Boxes,
    tone: "gold",
  },
  {
    to: "/dashboard/journal-entries/new",
    label: "قيد يومية",
    icon: BookOpen,
    tone: "danger",
  },
];

const TONE_BG = {
  primary: "from-teal-600 to-teal-500",
  gold: "from-amber-700 to-amber-500",
  success: "from-emerald-600 to-emerald-500",
  danger: "from-rose-700 to-rose-500",
  info: "from-indigo-700 to-indigo-500",
};

const TONE_GLOW = {
  primary: "hover:shadow-teal-500/30",
  gold: "hover:shadow-amber-500/30",
  success: "hover:shadow-emerald-500/30",
  danger: "hover:shadow-rose-500/30",
  info: "hover:shadow-indigo-500/30",
};

function QuickActions() {
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-3 gap-3 sm:grid-cols-6"
    >
      {QUICK_ACTIONS.map((a, i) => (
        <Link key={a.to} to={a.to} className="group">
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className={`flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${TONE_GLOW[a.tone]}`}
          >
            <motion.span
              whileHover={{ rotate: -8 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${TONE_BG[a.tone]}`}
            >
              <a.icon size={19} />
            </motion.span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {a.label}
            </span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

/* ------------------------------ بطاقة ------------------------------ */
function StatCard({ icon: Icon, label, value, format, sub, tone = "primary" }) {
  const isNumeric = typeof value === "number";
  const iconBg = {
    primary: "from-teal-600 to-teal-400",
    gold: "from-amber-700 to-amber-400",
    success: "from-emerald-600 to-emerald-400",
    danger: "from-rose-700 to-rose-400",
    info: "from-indigo-700 to-indigo-400",
  };
  const topBar = {
    primary: "bg-teal-500",
    gold: "bg-amber-500",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    info: "bg-indigo-500",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${topBar[tone]}`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
            {isNumeric ? (
              <AnimatedNumber value={value} format={format} />
            ) : (
              value
            )}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {sub}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: -8, scale: 1.08 }}
          className={`rounded-xl bg-gradient-to-br p-2.5 text-white shadow-md ${iconBg[tone]}`}
        >
          <Icon size={20} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function SectionCard({ title, children, className = "", icon: Icon }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {Icon && (
          <Icon size={15} className="text-teal-600 dark:text-teal-400" />
        )}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

/* --------------------------- تلميح مخصص للرسم --------------------------- */
function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color || p.stroke }}
          />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {fmtMoney(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState({ fromDate: "", toDate: "" });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetDashboardSummaryQuery(
      range.fromDate && range.toDate ? range : undefined,
    );

  const monthlyChartData = useMemo(() => {
    if (!data?.monthlyActivity) return [];
    return data.monthlyActivity.map((m) => ({
      name: MONTH_NAMES[(m.month - 1 + 12) % 12],
      المبيعات: m.sales,
      المشتريات: m.purchases,
    }));
  }, [data]);

  const invoiceStatusData = useMemo(() => {
    if (!data?.invoiceStatus) return [];
    const s = data.invoiceStatus;
    return [
      { name: "مدفوعة", value: s.paidCount, color: TOKENS.success },
      {
        name: "مدفوعة جزئيًا",
        value: s.partiallyPaidCount,
        color: TOKENS.goldSoft,
      },
      { name: "غير مدفوعة", value: s.unpaidCount, color: TOKENS.muted },
      { name: "متأخرة", value: s.overdueCount, color: TOKENS.danger },
    ].filter((d) => d.value > 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-teal-200 border-t-teal-600"
        />
        جاري تحميل بيانات لوحة التحكم...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
        <p className="font-semibold">حصل خطأ في تحميل الداشبورد</p>
        <p className="mt-1 text-sm opacity-80">
          {error?.data?.detail ||
            error?.data?.title ||
            "برجاء المحاولة مرة أخرى"}
        </p>
        <button
          onClick={refetch}
          className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <motion.div
      dir="rtl"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-1"
    >
      {/* رأس الصفحة — لحظة الهيرو الملوّنة الوحيدة في الصفحة */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 p-5 text-white shadow-lg"
      >
        <DecorativeBlobs />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-300" />
              <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            </div>
            <p className="mt-1 text-sm text-teal-100">
              {data?.fiscalYearName} • {data?.fromDate} إلى {data?.toDate} •{" "}
              {getCurrencyLabel(data?.baseCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={range.fromDate}
              onChange={(e) =>
                setRange((r) => ({ ...r, fromDate: e.target.value }))
              }
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/70 backdrop-blur focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300 [color-scheme:dark]"
            />
            <span className="text-sm text-teal-100">إلى</span>
            <input
              type="date"
              value={range.toDate}
              onChange={(e) =>
                setRange((r) => ({ ...r, toDate: e.target.value }))
              }
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/70 backdrop-blur focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300 [color-scheme:dark]"
            />
            {isFetching && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-xs text-teal-100"
              >
                جاري التحديث...
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* إجراءات سريعة */}
      <QuickActions />

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          icon={Landmark}
          label="صافي المبيعات"
          value={data?.sales?.net ?? 0}
          format={(v) => fmtMoney(v, data?.baseCurrency)}
          sub={`مستحق: ${fmtMoney(data?.sales?.outstanding, data?.baseCurrency)}`}
          tone="primary"
        />
        <StatCard
          icon={Package}
          label="صافي المشتريات"
          value={data?.purchases?.net ?? 0}
          format={(v) => fmtMoney(v, data?.baseCurrency)}
          sub={`مستحق: ${fmtMoney(data?.purchases?.outstanding, data?.baseCurrency)}`}
          tone="gold"
        />
        <StatCard
          icon={TrendingUp}
          label="إجمالي الربح"
          value={data?.profitability?.grossProfit ?? 0}
          format={(v) => fmtMoney(v, data?.baseCurrency)}
          sub={`هامش الربح: ${(data?.profitability?.grossMarginPercentage ?? 0).toFixed(1)}%`}
          tone="success"
        />
        <StatCard
          icon={Wallet}
          label="قيمة المخزون الحالية"
          value={data?.inventory?.currentInventoryValue ?? 0}
          format={(v) => fmtMoney(v, data?.baseCurrency)}
          sub={`${data?.inventory?.zeroStockItemCount ?? 0} صنف بدون رصيد`}
          tone="primary"
        />
        <StatCard
          icon={Users}
          label="الشركاء التجاريين"
          value={data?.counts?.businessPartnerCount ?? 0}
          format={(v) => Math.round(v).toLocaleString("ar-EG")}
          sub="عملاء وموردين"
          tone="info"
        />
        <StatCard
          icon={Briefcase}
          label="الموظفين"
          value={data?.counts?.employeeCount ?? 0}
          format={(v) => Math.round(v).toLocaleString("ar-EG")}
          tone="gold"
        />
        <StatCard
          icon={Truck}
          label="السائقين"
          value={data?.counts?.driverCount ?? 0}
          format={(v) => Math.round(v).toLocaleString("ar-EG")}
          tone="primary"
        />
        <StatCard
          icon={FileText}
          label="عدد الفواتير"
          value={data?.counts?.invoiceCount ?? 0}
          format={(v) => Math.round(v).toLocaleString("ar-EG")}
          tone="success"
        />
        <StatCard
          icon={Clock}
          label="فواتير متأخرة"
          value={data?.invoiceStatus?.overdueCount ?? 0}
          format={(v) => Math.round(v).toLocaleString("ar-EG")}
          sub={fmtMoney(data?.invoiceStatus?.overdueAmount, data?.baseCurrency)}
          tone="danger"
        />
        <StatCard
          icon={data?.accounting?.isReady ? CheckCircle2 : FileWarning}
          label="جاهزية الحسابات"
          value={
            data?.accounting?.isReady
              ? "جاهز"
              : `${data?.accounting?.issueCount} مشكلة`
          }
          tone={data?.accounting?.isReady ? "success" : "danger"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* رسم النشاط الشهري — Area chart بتدرّج لوني */}
        <SectionCard
          title="النشاط الشهري (مبيعات / مشتريات)"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={monthlyChartData}
              margin={{ top: 6, right: 6, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={TOKENS.primary}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={TOKENS.primary}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip currency={data?.baseCurrency} />}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="المبيعات"
                stroke={TOKENS.primary}
                strokeWidth={2.5}
                fill="url(#salesFill)"
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="المشتريات"
                stroke={TOKENS.gold}
                strokeWidth={2.5}
                dot={{ r: 3, fill: TOKENS.gold, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* حالة الفواتير */}
        <SectionCard title="حالة الفواتير" icon={FileWarning}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                stroke="none"
              >
                {invoiceStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  direction: "rtl",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* تنبيهات — متعمّد وضعها هنا تحت، بعد ما المستخدم شاف الأرقام الرئيسية */}
      {data?.alerts?.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          {data.alerts.map((a, i) => {
            const isCritical =
              a.severity === "Critical" || a.severity === "Error";
            return (
              <motion.div
                key={i}
                whileHover={{ x: -2 }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  isCritical
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400"
                }`}
              >
                {isCritical ? (
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    <AlertTriangle size={16} />
                  </motion.span>
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span>{a.message}</span>
                {a.count > 0 && (
                  <span className="mr-auto rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold dark:bg-black/20">
                    {a.count}
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* أرصدة الخزائن */}
      <SectionCard title="أرصدة الخزائن حسب العملة" icon={Wallet}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data?.cashBalances?.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-amber-400" />
              <p className="text-xs text-slate-500">
                {getCurrencyLabel(c.currency)}
              </p>
              <p className="mt-1 text-lg font-bold text-teal-700 dark:text-teal-400">
                <AnimatedNumber
                  value={c.currentBalance ?? 0}
                  format={(v) => fmtMoney(v, c.currency)}
                />
              </p>
              <p className="text-xs text-slate-400">{c.cashboxCount} خزينة</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}
