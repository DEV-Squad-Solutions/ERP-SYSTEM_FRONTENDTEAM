import { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  RefreshCw,
  Receipt,
  User,
  Store,
  CalendarDays,
  Package,
  TrendingUp,
  Wallet,
  Percent,
  AlertCircle,
  Printer,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";

import { useGetInvoiceProfitabilityDetailsQuery } from "../profitabilityApi";

import Button from "../../../shared/components/ui/Button";

const numberFormatter = new Intl.NumberFormat("ar-EG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return numberFormatter.format(Number(value) || 0);
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `${numberFormatter.format(Number(value) || 0)}%`;
};

/* =========================================================
   Animation
========================================================= */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   Helpers
========================================================= */

function InfoCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-primary/10">
          <Icon
            size={18}
            className="text-slate-600 transition-colors group-hover:text-primary"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>

          <p className="mt-1 truncate text-sm font-bold text-slate-900">
            {value || "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FinancialCard({
  icon: Icon,
  title,
  value,
  description,
  valueClassName = "text-slate-900",
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className={`mt-2 text-xl font-bold ${valueClassName}`}>{value}</p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={18} className="text-slate-600" />
        </div>
      </div>
    </motion.div>
  );
}

function MainMetric({
  icon: Icon,
  title,
  value,
  valueClassName = "text-slate-900",
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={18} />

        <span className="text-sm font-medium">{title}</span>
      </div>

      <p className={`mt-3 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </motion.div>
  );
}

function CostStatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "final") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        مكتملة
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <AlertCircle size={13} />
        معلقة
      </span>
    );
  }

  if (normalized === "partiallycosted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
        <AlertCircle size={13} />
        جزئية
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {status || "—"}
    </span>
  );
}

/* =========================================================
   Print Template
========================================================= */

function InvoiceProfitabilityPrint({ invoice }) {
  const lines = invoice?.lines ?? [];

  return (
    <div
      dir="rtl"
      className="invoice-profitability-print bg-white p-8 text-slate-900"
    >
      {/* Print Header */}
      <div className="mb-6 flex items-start justify-between border-b-2 border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold">تقرير ربحية الفاتورة</h1>

          <p className="mt-2 text-sm text-slate-600">
            رقم الفاتورة: <strong>{invoice.invoiceNumber || "—"}</strong>
          </p>
        </div>

        <div className="text-left text-sm text-slate-600">
          <p>
            التاريخ: <strong>{invoice.invoiceDate || "—"}</strong>
          </p>

          <p className="mt-1">
            العملة: <strong>{invoice.baseCurrency || "EGP"}</strong>
          </p>
        </div>
      </div>

      {/* Invoice Information */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">العميل</p>
          <p className="mt-1 font-semibold">
            {invoice.businessPartnerName || "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">المخزن</p>
          <p className="mt-1 font-semibold">{invoice.storeName || "—"}</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">عدد السطور</p>
          <p className="mt-1 font-semibold">
            {invoice.lineCount ?? lines.length}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">حالة التكلفة</p>
          <p className="mt-1 font-semibold">{invoice.costStatus || "—"}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">الإيراد الإجمالي</p>
          <p className="mt-1 text-lg font-bold">
            {formatNumber(invoice.grossRevenue)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">الخصم</p>
          <p className="mt-1 text-lg font-bold">
            {formatNumber(invoice.discountAmount)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">صافي الإيراد</p>
          <p className="mt-1 text-lg font-bold">
            {formatNumber(invoice.netRevenue)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">التكلفة</p>
          <p className="mt-1 text-lg font-bold">
            {formatNumber(invoice.recognizedCost)}
          </p>
        </div>
      </div>

      {/* Profit Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">مجمل الربح</p>
          <p className="mt-1 text-xl font-bold">
            {invoice.grossProfit !== null && invoice.grossProfit !== undefined
              ? formatNumber(invoice.grossProfit)
              : "غير مكتمل"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">هامش الربح</p>
          <p className="mt-1 text-xl font-bold">
            {formatPercentage(invoice.grossMarginPercentage)}
          </p>
        </div>
      </div>

      {/* Lines */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-2 py-2 text-right">
              الصنف
            </th>

            <th className="border border-slate-300 px-2 py-2">الكود</th>

            <th className="border border-slate-300 px-2 py-2">الوحدة</th>

            <th className="border border-slate-300 px-2 py-2">الكمية</th>

            <th className="border border-slate-300 px-2 py-2">سعر البيع</th>

            <th className="border border-slate-300 px-2 py-2">الإيراد</th>

            <th className="border border-slate-300 px-2 py-2">الخصم</th>

            <th className="border border-slate-300 px-2 py-2">صافي الإيراد</th>

            <th className="border border-slate-300 px-2 py-2">تكلفة الوحدة</th>

            <th className="border border-slate-300 px-2 py-2">التكلفة</th>

            <th className="border border-slate-300 px-2 py-2">الربح</th>

            <th className="border border-slate-300 px-2 py-2">الهامش</th>
          </tr>
        </thead>

        <tbody>
          {lines.map((line) => (
            <tr key={line.invoiceLineId}>
              <td className="border border-slate-300 px-2 py-2 font-medium">
                {line.itemName || "—"}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {line.itemCode || "—"}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {line.itemUnitName || "—"}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.quantity)}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.baseUnitPrice)}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.grossRevenue)}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.discountAmount)}
              </td>

              <td className="border border-slate-300 px-2 py-2 font-semibold">
                {formatNumber(line.netRevenue)}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.unitCost)}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {formatNumber(line.recognizedCost)}
              </td>

              <td className="border border-slate-300 px-2 py-2 font-semibold">
                {line.grossProfit !== null && line.grossProfit !== undefined
                  ? formatNumber(line.grossProfit)
                  : "غير مكتمل"}
              </td>

              <td className="border border-slate-300 px-2 py-2">
                {line.grossProfit !== null && line.grossProfit !== undefined
                  ? formatPercentage(line.grossMarginPercentage)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 border-t border-slate-300 pt-3 text-center text-xs text-slate-500">
        تم إنشاء التقرير بواسطة نظام الإدارة
      </div>
    </div>
  );
}

/* =========================================================
   Page
========================================================= */

export default function InvoiceProfitabilityDetailsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const printRef = useRef(null);

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetInvoiceProfitabilityDetailsQuery(invoiceId, {
    skip: !invoiceId,
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ربحية الفاتورة - ${invoice?.invoiceNumber || invoiceId}`,
  });

  /* =========================================================
     Loading
  ========================================================= */

  if (isLoading) {
    return (
      <div dir="rtl" className="p-4 md:p-6">
        <div className="space-y-6">
          <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>

          <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />

          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (isError || !invoice) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[450px] flex-col items-center justify-center p-6"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={34} className="text-red-500" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-800">
          تعذر تحميل تفاصيل الفاتورة
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          تأكد من أن الفاتورة موجودة وتنتمي للشركة الحالية.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>

          <Button type="button" onClick={() => navigate(-1)}>
            الرجوع
          </Button>
        </div>
      </div>
    );
  }

  const lines = invoice.lines ?? [];

  const hasPendingCost =
    String(invoice.costStatus || "").toLowerCase() !== "final" ||
    lines.some((line) => {
      const status = String(line.costStatus || "").toLowerCase();

      return status === "pending" || status === "partiallycosted";
    });

  const profitAvailable =
    invoice.grossProfit !== null && invoice.grossProfit !== undefined;

  return (
    <>
      {/* =====================================================
          Printable Content
      ===================================================== */}

      <div className="hidden">
        <div ref={printRef}>
          <InvoiceProfitabilityPrint invoice={invoice} />
        </div>
      </div>

      {/* =====================================================
          Screen
      ===================================================== */}

      <motion.div
        dir="rtl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 p-4 md:p-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            {/* Back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              title="رجوع"
            >
              <ArrowRight size={19} />
            </button>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Receipt size={22} className="text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  ربحية الفاتورة
                </h1>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {invoice.invoiceNumber}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                تحليل الإيراد والتكلفة والربح لكل صنف داخل الفاتورة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </Button>

            <Button type="button" onClick={handlePrint} className="gap-2">
              <Printer size={16} />
              طباعة
            </Button>
          </div>
        </motion.div>

        {/* Invoice Info */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InfoCard
            icon={Receipt}
            label="رقم الفاتورة"
            value={invoice.invoiceNumber}
          />

          <InfoCard
            icon={CalendarDays}
            label="التاريخ"
            value={invoice.invoiceDate}
          />

          <InfoCard
            icon={User}
            label="العميل"
            value={invoice.businessPartnerName}
          />

          <InfoCard icon={Store} label="المخزن" value={invoice.storeName} />
        </motion.div>

        {/* Financial Summary */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FinancialCard
            title="الإيراد الإجمالي"
            value={formatNumber(invoice.grossRevenue)}
            icon={Receipt}
            description={invoice.baseCurrency || "EGP"}
          />

          <FinancialCard
            title="الخصم"
            value={formatNumber(invoice.discountAmount)}
            icon={Wallet}
            valueClassName="text-red-600"
          />

          <FinancialCard
            title="التكلفة"
            value={formatNumber(invoice.recognizedCost)}
            icon={Wallet}
            description={invoice.baseCurrency || "EGP"}
          />

          <FinancialCard
            title="مجمل الربح"
            value={
              profitAvailable ? formatNumber(invoice.grossProfit) : "غير مكتمل"
            }
            icon={TrendingUp}
            valueClassName={
              profitAvailable ? "text-emerald-600" : "text-amber-600"
            }
          />
        </motion.div>

        {/* Main Profitability */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <MainMetric
            icon={Receipt}
            title="صافي الإيراد"
            value={formatNumber(invoice.netRevenue)}
          />

          <MainMetric
            icon={TrendingUp}
            title="مجمل الربح"
            value={
              profitAvailable ? formatNumber(invoice.grossProfit) : "غير مكتمل"
            }
            valueClassName={
              profitAvailable ? "text-emerald-600" : "text-amber-600"
            }
          />

          <MainMetric
            icon={Percent}
            title="هامش الربح"
            value={formatPercentage(invoice.grossMarginPercentage)}
          />
        </motion.div>

        {/* Cost Status */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl border p-4 ${
            hasPendingCost
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                hasPendingCost ? "bg-amber-100" : "bg-emerald-100"
              }`}
            >
              {hasPendingCost ? (
                <AlertCircle size={19} className="text-amber-600" />
              ) : (
                <TrendingUp size={19} className="text-emerald-600" />
              )}
            </div>

            <div>
              <p
                className={`font-bold ${
                  hasPendingCost ? "text-amber-800" : "text-emerald-800"
                }`}
              >
                {hasPendingCost
                  ? "تكلفة الفاتورة لم تكتمل بالكامل"
                  : "تكلفة الفاتورة مكتملة"}
              </p>

              <p
                className={`mt-1 text-sm ${
                  hasPendingCost ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {hasPendingCost
                  ? "بعض السطور قد تكون بتكلفة معلقة أو جزئية، لذلك لا يتم اعتبار الربح النهائي مكتملًا."
                  : "تم احتساب تكلفة جميع السطور ويمكن الاعتماد على الربح المعروض."}
              </p>

              {hasPendingCost && Number(invoice.pendingCostQuantity) > 0 && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  الكمية المعلقة:{" "}
                  <strong>{formatNumber(invoice.pendingCostQuantity)}</strong>
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lines */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Package size={18} className="text-slate-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">تفاصيل الأصناف</h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  عدد السطور: {invoice.lineCount ?? lines.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ArrowUpRight size={15} />
              تفاصيل التكلفة والربحية
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-right">
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الصنف
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الكود
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الوحدة
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الكمية
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    سعر البيع
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الإيراد
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الخصم
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    صافي الإيراد
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    تكلفة الوحدة
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    التكلفة
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الربح
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    الهامش
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    حالة التكلفة
                  </th>
                </tr>
              </thead>

              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-14 text-center text-slate-500"
                    >
                      لا توجد أصناف في الفاتورة
                    </td>
                  </tr>
                ) : (
                  lines.map((line, index) => {
                    const lineProfitAvailable =
                      line.grossProfit !== null &&
                      line.grossProfit !== undefined;

                    const isReturn = line.invoiceType === "SalesReturn";

                    return (
                      <motion.tr
                        key={line.invoiceLineId}
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: Math.min(index * 0.025, 0.4),
                        }}
                        className={`border-b border-slate-100 transition ${
                          isReturn
                            ? "bg-red-50/40 hover:bg-red-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {line.itemName || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-500">
                          {line.itemCode || "—"}
                        </td>

                        <td className="px-4 py-3">
                          {line.itemUnitName || "—"}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            Number(line.quantity) < 0
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatNumber(line.quantity)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(line.baseUnitPrice)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(line.grossRevenue)}
                        </td>

                        <td className="px-4 py-3 text-red-600">
                          {formatNumber(line.discountAmount)}
                        </td>

                        <td className="px-4 py-3 font-semibold">
                          {formatNumber(line.netRevenue)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(line.unitCost)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(line.recognizedCost)}
                        </td>

                        <td
                          className={`px-4 py-3 font-bold ${
                            lineProfitAvailable
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {lineProfitAvailable
                            ? formatNumber(line.grossProfit)
                            : "غير مكتمل"}
                        </td>

                        <td className="px-4 py-3">
                          {lineProfitAvailable
                            ? formatPercentage(line.grossMarginPercentage)
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <CostStatusBadge status={line.costStatus} />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* =====================================================
          Print CSS
      ===================================================== */}

      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            body {
              background: white !important;
            }

            .invoice-profitability-print {
              display: block !important;
              width: 100%;
              color: #0f172a;
              background: white;
              font-family: Arial, Tahoma, sans-serif;
            }

            .invoice-profitability-print table {
              width: 100%;
            }

            .invoice-profitability-print th,
            .invoice-profitability-print td {
              vertical-align: middle;
            }

            .invoice-profitability-print tr {
              break-inside: avoid;
            }
          }
        `}
      </style>
    </>
  );
}
