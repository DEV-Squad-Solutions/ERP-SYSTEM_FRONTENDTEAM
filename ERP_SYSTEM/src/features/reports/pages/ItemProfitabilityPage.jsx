import { useMemo, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  TrendingUp,
  Package,
  Wallet,
  Percent,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronDown,
  Printer,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

import { useGetItemProfitabilityQuery } from "../profitabilityApi";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetItemsCategoriesSelectQuery } from "../../itemsCategories/itemsCategoriesApi";
import { useGetItemsSelectQuery } from "../../inventory/inventoryApi";

import { toast } from "sonner";

const today = new Date().toISOString().slice(0, 10);

const initialFilters = {
  fromDate: today,
  toDate: today,
  businessPartnerId: "",
  storeId: "",
  itemId: "",
  itemsCategoryId: "",
  search: "",
};

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

/* -------------------------------------------------------------------------- */
/* Animations                                                                 */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Summary Card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  danger = false,
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -3,
        transition: {
          duration: 0.2,
        },
      }}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{title}</p>

          <p
            className={`mt-2 truncate text-xl font-bold tracking-tight ${
              danger ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-slate-400">{description}</p>
          )}
        </div>

        <div
          className={`shrink-0 rounded-xl p-2.5 transition-colors ${
            danger
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-50 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Cost Status                                                                */
/* -------------------------------------------------------------------------- */

function CostStatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "final") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        مكتملة التكلفة
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
        <AlertCircle size={12} />
        معلقة
      </span>
    );
  }

  if (normalized === "partiallycosted") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
        <AlertCircle size={12} />
        جزئية
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
      {status || "—"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Print Template                                                             */
/* -------------------------------------------------------------------------- */

function ItemProfitabilityPrint({ data, filters }) {
  const items = data?.items ?? [];
  const summary = data?.summary ?? {};

  return (
    <div
      ref={undefined}
      dir="rtl"
      className="hidden bg-white p-8 text-black print:block"
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div className="mb-6 border-b-2 border-black pb-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">تقرير ربحية الأصناف</h1>

            <p className="mt-1 text-sm text-gray-600">
              إجمالي ربحية كل صنف بعد خصم مرتجعات البيع
            </p>
          </div>

          <div className="text-left text-sm">
            <p>
              من: <strong>{filters.fromDate || "—"}</strong>
            </p>

            <p>
              إلى: <strong>{filters.toDate || "—"}</strong>
            </p>

            <p className="mt-1">
              تاريخ الطباعة:{" "}
              <strong>{new Date().toLocaleDateString("ar-EG")}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}

      <div className="mb-6 grid grid-cols-6 gap-2">
        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">إيراد المبيعات</div>

          <div className="mt-1 font-bold">
            {formatNumber(summary.salesRevenue)}
          </div>
        </div>

        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">إيراد المرتجعات</div>

          <div className="mt-1 font-bold">
            {formatNumber(summary.returnRevenue)}
          </div>
        </div>

        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">صافي الإيراد</div>

          <div className="mt-1 font-bold">
            {formatNumber(summary.netRevenue)}
          </div>
        </div>

        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">مجمل الربح</div>

          <div className="mt-1 font-bold">
            {formatNumber(summary.grossProfit)}
          </div>
        </div>

        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">هامش الربح</div>

          <div className="mt-1 font-bold">
            {formatPercentage(summary.grossMarginPercentage)}
          </div>
        </div>

        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">عدد الأصناف</div>

          <div className="mt-1 font-bold">
            {formatNumber(summary.itemCount)}
          </div>
        </div>
      </div>

      {/* Table */}

      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">الصنف</th>
            <th className="border p-2">الكود</th>
            <th className="border p-2">الوحدة</th>
            <th className="border p-2">كمية البيع</th>
            <th className="border p-2">المرتجع</th>
            <th className="border p-2">الصافي</th>
            <th className="border p-2">إيراد البيع</th>
            <th className="border p-2">تكلفة البيع</th>
            <th className="border p-2">إيراد المرتجع</th>
            <th className="border p-2">تكلفة المرتجع</th>
            <th className="border p-2">صافي الإيراد</th>
            <th className="border p-2">التكلفة</th>
            <th className="border p-2">الربح</th>
            <th className="border p-2">الهامش</th>
            <th className="border p-2">الفواتير</th>
            <th className="border p-2">الحالة</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const profitAvailable =
              item.grossProfit !== null && item.grossProfit !== undefined;

            return (
              <tr key={item.itemId}>
                <td className="border p-2 font-semibold">
                  {item.itemName || "—"}
                </td>

                <td className="border p-2">{item.itemCode || "—"}</td>

                <td className="border p-2">{item.itemUnitName || "—"}</td>

                <td className="border p-2">
                  {formatNumber(item.salesQuantity)}
                </td>

                <td className="border p-2">
                  {formatNumber(item.returnQuantity)}
                </td>

                <td className="border p-2 font-semibold">
                  {formatNumber(item.netQuantity)}
                </td>

                <td className="border p-2">
                  {formatNumber(item.salesRevenue)}
                </td>

                <td className="border p-2">{formatNumber(item.salesCost)}</td>

                <td className="border p-2">
                  {formatNumber(item.returnRevenue)}
                </td>

                <td className="border p-2">{formatNumber(item.returnCost)}</td>

                <td className="border p-2 font-semibold">
                  {formatNumber(item.netRevenue)}
                </td>

                <td className="border p-2">
                  {formatNumber(item.recognizedCost)}
                </td>

                <td className="border p-2 font-semibold">
                  {profitAvailable
                    ? formatNumber(item.grossProfit)
                    : "غير مكتمل"}
                </td>

                <td className="border p-2">
                  {profitAvailable
                    ? formatPercentage(item.grossMarginPercentage)
                    : "—"}
                </td>

                <td className="border p-2">
                  {formatNumber(item.invoiceCount)}
                </td>

                <td className="border p-2">{item.costStatus || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {summary.pendingLineCount > 0 && (
        <div className="mt-5 rounded border border-amber-400 p-3 text-sm">
          توجد {summary.pendingLineCount} سطر بتكلفة معلقة.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ItemProfitabilityPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [pageNumber, setPageNumber] = useState(1);

  const [filtersOpen, setFiltersOpen] = useState(true);

  const pageSize = 20;

  const printRef = useRef(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetItemProfitabilityQuery({
      ...appliedFilters,
      pageNumber,
      pageSize,
      includeReturns: true,
    });

  const { data: parties = [], isLoading: partiesLoading } =
    useGetPartiesSelectQuery();

  const { data: stores = [], isLoading: storesLoading } =
    useGetStoresSelectQuery();

  const { data: items = [], isLoading: itemsLoading } =
    useGetItemsSelectQuery();

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetItemsCategoriesSelectQuery();

  const itemRows = data?.items ?? [];
  const summary = data?.summary ?? {};

  /* ------------------------------------------------------------------------ */
  /* Print                                                                    */
  /* ------------------------------------------------------------------------ */

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير-ربحية-الأصناف-${appliedFilters.fromDate}-${appliedFilters.toDate}`,
  });

  /* ------------------------------------------------------------------------ */
  /* Options                                                                  */
  /* ------------------------------------------------------------------------ */

  const partyOptions = useMemo(
    () => [
      {
        value: "",
        label: "كل العملاء",
      },
      ...(parties?.items ?? parties ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    ],
    [parties],
  );

  const storeOptions = useMemo(
    () => [
      {
        value: "",
        label: "كل المخازن",
      },
      ...(stores?.items ?? stores ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    ],
    [stores],
  );

  const itemOptions = useMemo(
    () => [
      {
        value: "",
        label: "كل الأصناف",
      },
      ...(items?.items ?? items ?? []).map((item) => ({
        value: String(item.id),
        label: item.name || item.itemName,
      })),
    ],
    [items],
  );

  const categoryOptions = useMemo(
    () => [
      {
        value: "",
        label: "كل التصنيفات",
      },
      ...(categories?.items ?? categories ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    ],
    [categories],
  );

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    if (
      filters.fromDate &&
      filters.toDate &&
      filters.fromDate > filters.toDate
    ) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");

      return;
    }

    setPageNumber(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPageNumber(1);
  };

  const totalPages = data?.totalPages ?? 1;

  const hasActiveFilters =
    filters.businessPartnerId ||
    filters.storeId ||
    filters.itemId ||
    filters.itemsCategoryId ||
    filters.search;

  return (
    <>
      <div dir="rtl" className="min-h-full space-y-5 bg-slate-50/50 p-4 md:p-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  ربحية الأصناف
                </h1>

                <p className="mt-1 text-xs text-slate-500 md:text-sm">
                  إجمالي ربحية كل صنف بعد خصم مرتجعات البيع
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={refetch}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              disabled={isLoading || itemRows.length === 0}
              className="gap-2"
            >
              <Printer size={16} />
              طباعة
            </Button>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Filters                                                            */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setFiltersOpen((previous) => !previous)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition hover:bg-slate-50 md:px-5"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <SlidersHorizontal size={17} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-800">
                    فلاتر التقرير
                  </h2>

                  {hasActiveFilters && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      فلاتر مفعلة
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  حدد الفترة والعميل والمخزن والصنف والتصنيف
                </p>
              </div>
            </div>

            <motion.div
              animate={{
                rotate: filtersOpen ? 180 : 0,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <ChevronDown size={18} className="text-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut",
                }}
              >
                <div className="border-t border-slate-100 px-4 pb-4 pt-4 md:px-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Input
                      label="من تاريخ"
                      type="date"
                      value={filters.fromDate}
                      onChange={(event) =>
                        updateFilter("fromDate", event.target.value)
                      }
                    />

                    <Input
                      label="إلى تاريخ"
                      type="date"
                      value={filters.toDate}
                      onChange={(event) =>
                        updateFilter("toDate", event.target.value)
                      }
                    />

                    <CompactSelect
                      label="العميل"
                      options={partyOptions}
                      value={filters.businessPartnerId}
                      onChange={(value) =>
                        updateFilter("businessPartnerId", value)
                      }
                      loading={partiesLoading}
                    />

                    <CompactSelect
                      label="المخزن"
                      options={storeOptions}
                      value={filters.storeId}
                      onChange={(value) => updateFilter("storeId", value)}
                      loading={storesLoading}
                    />

                    <CompactSelect
                      label="الصنف"
                      options={itemOptions}
                      value={filters.itemId}
                      onChange={(value) => updateFilter("itemId", value)}
                      loading={itemsLoading}
                    />

                    <CompactSelect
                      label="التصنيف"
                      options={categoryOptions}
                      value={filters.itemsCategoryId}
                      onChange={(value) =>
                        updateFilter("itemsCategoryId", value)
                      }
                      loading={categoriesLoading}
                    />
                  </div>

                  {/* Search بدون Label */}

                  <div className="mt-3">
                    <Input
                      placeholder="اسم الصنف أو الكود..."
                      value={filters.search}
                      onChange={(event) =>
                        updateFilter("search", event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          applyFilters();
                        }
                      }}
                      icon={<Search size={16} />}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={applyFilters}
                      disabled={isFetching}
                      className="gap-2"
                    >
                      <Search size={15} />
                      تطبيق
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFilters}
                      className="gap-2"
                    >
                      <X size={15} />
                      إعادة ضبط
                    </Button>

                    <div className="mr-auto flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      {filters.fromDate} — {filters.toDate}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Summary                                                            */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
        >
          <SummaryCard
            title="إيراد المبيعات"
            value={formatNumber(summary.salesRevenue)}
            icon={ShoppingCart}
            description={data?.baseCurrency || "EGP"}
          />

          <SummaryCard
            title="إيراد المرتجعات"
            value={formatNumber(summary.returnRevenue)}
            icon={RotateCcw}
            description={data?.baseCurrency || "EGP"}
          />

          <SummaryCard
            title="صافي الإيراد"
            value={formatNumber(summary.netRevenue)}
            icon={Wallet}
            description={data?.baseCurrency || "EGP"}
          />

          <SummaryCard
            title="مجمل الربح"
            value={formatNumber(summary.grossProfit)}
            icon={TrendingUp}
            danger={summary.pendingLineCount > 0}
            description={data?.baseCurrency || "EGP"}
          />

          <SummaryCard
            title="هامش الربح"
            value={formatPercentage(summary.grossMarginPercentage)}
            icon={Percent}
          />

          <SummaryCard
            title="عدد الأصناف"
            value={formatNumber(summary.itemCount)}
            icon={Package}
            description={
              summary.pendingLineCount > 0
                ? `${summary.pendingLineCount} سطر بتكلفة معلقة`
                : undefined
            }
            danger={summary.pendingLineCount > 0}
          />
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Warning                                                            */}
        {/* ------------------------------------------------------------------ */}

        <AnimatePresence>
          {summary.pendingLineCount > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  توجد أصناف لم تكتمل تكلفتها
                </p>

                <p className="mt-1 text-xs">
                  عدد السطور ذات التكلفة المعلقة:{" "}
                  <strong>{summary.pendingLineCount}</strong>
                </p>

                <p className="mt-1 text-[11px] text-amber-700">
                  يتم إخفاء الربح النهائي للصنف عندما تكون تكلفته غير مكتملة.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------------ */}
        {/* Table                                                              */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.15,
          }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Table Header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 md:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                ربحية الأصناف
              </h2>

              <p className="mt-1 text-[11px] text-slate-400">
                إجمالي النتائج: {data?.totalCount ?? 0}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isFetching && (
                <RefreshCw size={16} className="animate-spin text-slate-400" />
              )}

              <div className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                {data?.baseCurrency || "EGP"}
              </div>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full text-xs">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-200 text-right text-slate-600">
                  <th className="px-4 py-3 font-semibold">الصنف</th>

                  <th className="px-4 py-3 font-semibold">الكود</th>

                  <th className="px-4 py-3 font-semibold">الوحدة</th>

                  <th className="px-4 py-3 font-semibold">كمية البيع</th>

                  <th className="px-4 py-3 font-semibold">المرتجع</th>

                  <th className="px-4 py-3 font-semibold">الصافي</th>

                  <th className="px-4 py-3 font-semibold">إيراد البيع</th>

                  <th className="px-4 py-3 font-semibold">تكلفة البيع</th>

                  <th className="px-4 py-3 font-semibold">إيراد المرتجع</th>

                  <th className="px-4 py-3 font-semibold">تكلفة المرتجع</th>

                  <th className="px-4 py-3 font-semibold">صافي الإيراد</th>

                  <th className="px-4 py-3 font-semibold">التكلفة</th>

                  <th className="px-4 py-3 font-semibold">الربح</th>

                  <th className="px-4 py-3 font-semibold">الهامش</th>

                  <th className="px-4 py-3 font-semibold">الفواتير</th>

                  <th className="px-4 py-3 font-semibold">حالة التكلفة</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      {Array.from({
                        length: 16,
                      }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-4">
                          <div className="h-3 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-12 text-center text-sm text-red-500"
                    >
                      حدث خطأ أثناء تحميل التقرير
                    </td>
                  </tr>
                ) : itemRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      لا توجد بيانات مطابقة للفلاتر
                    </td>
                  </tr>
                ) : (
                  itemRows.map((item) => {
                    const profitAvailable =
                      item.grossProfit !== null &&
                      item.grossProfit !== undefined;

                    return (
                      <motion.tr
                        key={item.itemId}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-slate-800">
                          {item.itemName || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-500">
                          {item.itemCode || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {item.itemUnitName || "—"}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(item.salesQuantity)}
                        </td>

                        <td className="px-4 py-3 text-red-600">
                          {formatNumber(item.returnQuantity)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formatNumber(item.netQuantity)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(item.salesRevenue)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(item.salesCost)}
                        </td>

                        <td className="px-4 py-3 text-red-600">
                          {formatNumber(item.returnRevenue)}
                        </td>

                        <td className="px-4 py-3 text-red-600">
                          {formatNumber(item.returnCost)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formatNumber(item.netRevenue)}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(item.recognizedCost)}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            profitAvailable
                              ? Number(item.grossProfit) >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                              : "text-slate-400"
                          }`}
                        >
                          {profitAvailable
                            ? formatNumber(item.grossProfit)
                            : "غير مكتمل"}
                        </td>

                        <td className="px-4 py-3">
                          {profitAvailable
                            ? formatPercentage(item.grossMarginPercentage)
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          {formatNumber(item.invoiceCount)}
                        </td>

                        <td className="px-4 py-3">
                          <CostStatusBadge status={item.costStatus} />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Print                                                                */}
      {/* -------------------------------------------------------------------- */}

      <div ref={printRef}>
        <ItemProfitabilityPrint data={data} filters={appliedFilters} />
      </div>
    </>
  );
}
