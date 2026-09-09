// src/features/journalEntries/pages/JournalEntriesListPage.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Eye,
  FileText,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
  SlidersHorizontal,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Layers3,
  ChevronLeft,
} from "lucide-react";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Pagination from "../../../shared/components/ui/Pagination";
import { selectIsAdmin } from "../../auth/authSlice";
import { useGetFiscalYearsSelectQuery } from "../../fiscalYears/fiscalYearsApi";
import {
  useGetJournalEntriesQuery,
  useDeleteJournalEntryMutation,
} from "../journalEntriesApi";
import { useJournalEntriesListPrint } from "../../../shared/hooks/useJournalEntriesListPrint";
import JournalEntriesListPrintTemplate from "../../../shared/components/print/JournalEntriesListPrintTemplate";

// =========================================================
// Constants
// =========================================================

const ENTRY_TYPE_OPTIONS = [
  { value: "Manual", label: "يدوي" },
  { value: "Adjustment", label: "تسوية" },
  { value: "Opening", label: "افتتاحي" },
  { value: "Automatic", label: "تلقائي" },
];

const STATUS_OPTIONS = [
  { value: "Posted", label: "مرحّل" },
  { value: "Reversed", label: "معكوس" },
];

const DEFAULT_PAGE_SIZE = 20;

// =========================================================
// Helpers
// =========================================================

function money(value) {
  return Number(value ?? 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";

  const date = String(value).split("T")[0];
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function getEntryTypeLabel(type) {
  if (typeof type === "number") {
    return (
      {
        1: "يدوي",
        2: "تسوية",
        3: "افتتاحي",
        4: "تلقائي",
      }[type] ?? type
    );
  }

  return (
    {
      Manual: "يدوي",
      Adjustment: "تسوية",
      Opening: "افتتاحي",
      Automatic: "تلقائي",
    }[type] ??
    type ??
    "-"
  );
}

function getStatusLabel(status) {
  if (typeof status === "number") {
    return (
      {
        1: "مرحّل",
        2: "معكوس",
      }[status] ?? status
    );
  }

  return (
    {
      Posted: "مرحّل",
      Reversed: "معكوس",
    }[status] ??
    status ??
    "-"
  );
}

function getSourceTypeLabel(sourceType) {
  return (
    {
      Invoice: "فاتورة",
      CashVoucher: "سند خزينة",
      PartnerOpeningBalance: "رصيد افتتاحي طرف",
      CashboxOpeningBalance: "رصيد افتتاحي خزينة",
      StockOpeningBalance: "رصيد افتتاحي مخزون",
    }[sourceType] ??
    sourceType ??
    ""
  );
}

function isAutomaticEntry(entry) {
  return (
    entry?.entryType === "Automatic" ||
    entry?.entryType === 4 ||
    entry?.entryType === "4"
  );
}

function isReversedEntry(entry) {
  return (
    entry?.status === "Reversed" || entry?.status === 2 || entry?.status === "2"
  );
}

/**
 * استخراج العملات الفعلية من سطور القيد
 *
 * مهم:
 * لا نعتمد على اسم الطرف مثل "محمد دولار".
 * العملة الصحيحة تأتي من:
 * line.currency
 */
function getEntryCurrencies(entry) {
  return [
    ...new Set(
      (entry?.lines ?? [])
        .map((line) => line?.currency)
        .filter(Boolean)
        .map((currency) => String(currency).toUpperCase()),
    ),
  ];
}

// =========================================================
// Animation
// =========================================================

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 5,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
};

// =========================================================
// Small UI Components
// =========================================================

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
  primary = false,
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        text-sm
        font-medium
        transition-all
        duration-200
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          primary
            ? `
              bg-emerald-800
              text-white
              shadow-sm
              shadow-emerald-900/10
              hover:bg-emerald-900
            `
            : danger
              ? `
                text-gray-400
                hover:bg-red-50
                hover:text-red-600
              `
              : `
                border
                border-gray-200
                bg-white
                text-gray-600
                shadow-sm
                hover:border-gray-300
                hover:bg-gray-50
                hover:text-gray-800
              `
        }
      `}
    >
      <Icon size={16} />
      {label && <span>{label}</span>}
    </motion.button>
  );
}

// =========================================================
// Currency Badge
// =========================================================

function CurrencyBadge({ currency, multi = false }) {
  if (!currency && !multi) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-bold text-gray-400">
        <Coins size={12} />-
      </span>
    );
  }

  if (multi) {
    return (
      <span
        title="القيد يحتوي على أكثر من عملة"
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          border
          border-amber-200
          bg-amber-50
          px-2.5
          py-1.5
          text-[10px]
          font-bold
          text-amber-700
        "
      >
        <Layers3 size={12} />
        متعدد
      </span>
    );
  }

  return (
    <span
      title={`عملة القيد: ${currency}`}
      className="
        inline-flex
        min-w-[48px]
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        border-emerald-100
        bg-emerald-50
        px-2.5
        py-1.5
        text-[10px]
        font-extrabold
        tracking-wide
        text-emerald-700
      "
    >
      <Coins size={12} />
      {currency}
    </span>
  );
}

// =========================================================
// Component
// =========================================================

export default function JournalEntriesListPage() {
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  // -------------------------------------------------------
  // Filters
  // -------------------------------------------------------

  const [filters, setFilters] = useState({
    search: "",
    fiscalYearId: null,
    entryType: null,
    status: null,
    fromDate: "",
    toDate: "",
  });

  // -------------------------------------------------------
  // Pagination
  // -------------------------------------------------------

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // -------------------------------------------------------
  // Fiscal Years
  // -------------------------------------------------------

  const { data: fiscalYears } = useGetFiscalYearsSelectQuery();

  const fiscalYearOptions = (fiscalYears ?? []).map((fy) => ({
    value: fy.id,
    label: fy.name,
  }));

  const selectedFiscalYear = fiscalYearOptions.find(
    (option) => String(option.value) === String(filters.fiscalYearId),
  );

  // -------------------------------------------------------
  // Query
  // -------------------------------------------------------

  const queryParams = {
    PageNumber: page,
    PageSize: pageSize,
    Search: filters.search || undefined,
    FiscalYearId: filters.fiscalYearId || undefined,
    EntryType: filters.entryType || undefined,
    Status: filters.status || undefined,
    FromDate: filters.fromDate || undefined,
    ToDate: filters.toDate || undefined,
  };

  const { data, isLoading, isFetching, refetch } =
    useGetJournalEntriesQuery(queryParams);

  const [deleteEntry, { isLoading: isDeleting }] =
    useDeleteJournalEntryMutation();

  const entries = data?.items ?? [];

  // -------------------------------------------------------
  // Print
  // -------------------------------------------------------

  const { printList, printRef } = useJournalEntriesListPrint({
    title: "تقرير قيود اليومية",
  });

  // -------------------------------------------------------
  // Summary
  // -------------------------------------------------------

  const summary = useMemo(() => {
    const totalDebit = entries.reduce(
      (sum, entry) => sum + Number(entry.totalDebit ?? 0),
      0,
    );

    const totalCredit = entries.reduce(
      (sum, entry) => sum + Number(entry.totalCredit ?? 0),
      0,
    );

    const currencies = [
      ...new Set(
        entries.flatMap((entry) => getEntryCurrencies(entry)).filter(Boolean),
      ),
    ];

    return {
      totalDebit,
      totalCredit,
      difference: totalDebit - totalCredit,
      count: entries.length,
      currencies,
    };
  }, [entries]);

  // -------------------------------------------------------
  // Filters
  // -------------------------------------------------------

  const updateFilter = (key, value) => {
    setPage(1);

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setPage(1);

    setFilters({
      search: "",
      fiscalYearId: null,
      entryType: null,
      status: null,
      fromDate: "",
      toDate: "",
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.fiscalYearId) ||
    Boolean(filters.entryType) ||
    Boolean(filters.status) ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate);

  // -------------------------------------------------------
  // Delete
  // -------------------------------------------------------

  const handleDelete = async (entry) => {
    try {
      await deleteEntry({
        id: entry.id,
        rowVersion: entry.rowVersion,
      }).unwrap();
    } catch (error) {
      console.error("فشل حذف القيد", error);
    }
  };

  // =======================================================
  // Render
  // =======================================================

  return (
    <>
      <motion.div
        dir="rtl"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="
          min-h-screen
          w-full
          overflow-x-hidden
          bg-gray-50
          px-3
          py-4
          sm:px-5
          sm:py-5
          lg:px-7
          lg:py-6
        "
      >
        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-100
                text-emerald-700
                shadow-sm
              "
            >
              <BookOpen size={22} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  قيود اليومية
                </h1>

                {data?.totalCount != null && (
                  <span
                    className="
                      hidden
                      rounded-full
                      bg-gray-100
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      text-gray-500
                      sm:inline-flex
                    "
                  >
                    {data.totalCount.toLocaleString("ar-EG")} قيد
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                إدارة ومراجعة القيود المحاسبية اليومية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              icon={RefreshCw}
              label="تحديث"
              onClick={refetch}
              disabled={isFetching}
            />

            <ActionButton
              icon={Printer}
              label="طباعة"
              onClick={printList}
              disabled={isLoading || entries.length === 0}
            />

            <ActionButton
              icon={Plus}
              label="قيد جديد"
              primary
              onClick={() => navigate("/dashboard/journal-entries/new")}
            />
          </div>
        </div>

        {/* =================================================
            Quick Summary
        ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Debit */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3.5
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-400">
                  إجمالي المدين
                </p>

                <p className="mt-1 text-lg font-bold tabular-nums text-gray-800">
                  {money(summary.totalDebit)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ArrowDownLeft size={17} />
              </div>
            </div>
          </div>

          {/* Credit */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3.5
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-400">
                  إجمالي الدائن
                </p>

                <p className="mt-1 text-lg font-bold tabular-nums text-gray-800">
                  {money(summary.totalCredit)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>

          {/* Currency */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3.5
              shadow-sm
            "
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-400">
                  العملات المستخدمة
                </p>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {summary.currencies.length > 0 ? (
                    summary.currencies.map((currency) => (
                      <span
                        key={currency}
                        className="
                          rounded-md
                          bg-emerald-50
                          px-2
                          py-0.5
                          text-[10px]
                          font-bold
                          text-emerald-700
                        "
                      >
                        {currency}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">
                      -
                    </span>
                  )}
                </div>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Coins size={17} />
              </div>
            </div>
          </div>

          {/* Difference */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3.5
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-400">الفرق</p>

                <p
                  className={`
                    mt-1
                    text-lg
                    font-bold
                    tabular-nums
                    ${
                      Math.abs(summary.difference) < 0.01
                        ? "text-emerald-700"
                        : "text-red-600"
                    }
                  `}
                >
                  {money(Math.abs(summary.difference))}
                </p>
              </div>

              <div
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    Math.abs(summary.difference) < 0.01
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }
                `}
              >
                {Math.abs(summary.difference) < 0.01 ? "✓" : "!"}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            Filters
        ================================================= */}

        <div
          className="
            mb-5
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-gray-100
              px-4
              py-3.5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            <div className="flex items-center gap-2.5">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-700
                "
              >
                <SlidersHorizontal size={16} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  تصفية القيود
                </h2>

                <p className="text-[11px] text-gray-400">
                  البحث والتصفية حسب بيانات القيد
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={resetFilters}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  self-start
                  rounded-lg
                  px-2.5
                  py-1.5
                  text-xs
                  font-medium
                  text-gray-500
                  transition
                  hover:bg-red-50
                  hover:text-red-600
                  sm:self-auto
                "
              >
                <RotateCcw size={13} />
                إعادة ضبط
              </motion.button>
            )}
          </div>

          <div className="p-4 sm:p-5">
            <div
              className="
                grid
                grid-cols-1
                gap-3.5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-6
              "
            >
              {/* Search */}

              <div className="min-w-0 xl:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  البحث
                </label>

                <div className="relative">
                  <Search
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) =>
                      updateFilter("search", event.target.value)
                    }
                    placeholder="رقم القيد، البيان، المصدر..."
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50/60
                      py-2.5
                      pl-9
                      pr-9
                      text-sm
                      text-gray-800
                      outline-none
                      transition-all
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />

                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => updateFilter("search", "")}
                      className="
                        absolute
                        left-2.5
                        top-1/2
                        flex
                        h-6
                        w-6
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-md
                        text-gray-400
                        transition
                        hover:bg-gray-100
                        hover:text-gray-700
                      "
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Fiscal Year */}

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  السنة المالية
                </label>

                <CompactSelect
                  value={filters.fiscalYearId}
                  onChange={(value) => updateFilter("fiscalYearId", value)}
                  options={fiscalYearOptions}
                  placeholder="كل السنوات"
                />
              </div>

              {/* Entry Type */}

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  نوع القيد
                </label>

                <CompactSelect
                  value={filters.entryType}
                  onChange={(value) => updateFilter("entryType", value)}
                  options={ENTRY_TYPE_OPTIONS}
                  placeholder="كل الأنواع"
                />
              </div>

              {/* Status */}

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  الحالة
                </label>

                <CompactSelect
                  value={filters.status}
                  onChange={(value) => updateFilter("status", value)}
                  options={STATUS_OPTIONS}
                  placeholder="كل الحالات"
                />
              </div>

              {/* From */}

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  من تاريخ
                </label>

                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(event) =>
                      updateFilter("fromDate", event.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50/60
                      px-3
                      py-2.5
                      pr-9
                      text-sm
                      text-gray-700
                      outline-none
                      transition
                      hover:border-gray-300
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />
                </div>
              </div>

              {/* To */}

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  إلى تاريخ
                </label>

                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(event) =>
                      updateFilter("toDate", event.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50/60
                      px-3
                      py-2.5
                      pr-9
                      text-sm
                      text-gray-700
                      outline-none
                      transition
                      hover:border-gray-300
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            Table Header
        ================================================= */}

        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <FileText size={15} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  القيود اليومية
                </span>

                {data?.totalCount != null && (
                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-emerald-700
                    "
                  >
                    {data.totalCount.toLocaleString("ar-EG")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <RefreshCw size={12} className="animate-spin" />
              جاري التحديث...
            </div>
          )}
        </div>

        {/* =================================================
            Table
        ================================================= */}

        <div
          className="
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1250px]">
              {/* Table Header */}

              <div
                className="
                  grid
                  grid-cols-[100px_105px_minmax(250px,1fr)_95px_100px_125px_125px_95px_105px]
                  gap-2
                  border-b
                  border-gray-100
                  bg-gray-50
                  px-4
                  py-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-gray-400
                  sm:px-6
                "
              >
                <span>رقم القيد</span>
                <span>التاريخ</span>
                <span>البيان / المصدر</span>
                <span>النوع</span>
                <span>العملة</span>
                <span className="text-left">مدين</span>
                <span className="text-left">دائن</span>
                <span>الحالة</span>
                <span className="text-left">الإجراءات</span>
              </div>

              {/* Loading */}

              {isLoading && (
                <div className="divide-y divide-gray-50">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="
                        grid
                        grid-cols-[100px_105px_minmax(250px,1fr)_95px_100px_125px_125px_95px_105px]
                        items-center
                        gap-2
                        px-4
                        py-4
                        sm:px-6
                      "
                    >
                      <div className="h-4 w-20 animate-pulse rounded-md bg-gray-100" />
                      <div className="h-3.5 w-20 animate-pulse rounded-md bg-gray-100" />
                      <div className="h-4 w-52 animate-pulse rounded-md bg-gray-100" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-6 w-14 animate-pulse rounded-lg bg-gray-100" />
                      <div className="ml-auto h-4 w-20 animate-pulse rounded-md bg-gray-100" />
                      <div className="ml-auto h-4 w-20 animate-pulse rounded-md bg-gray-100" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                      <div className="ml-auto h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* Rows */}

              {!isLoading && (
                <AnimatePresence mode="popLayout">
                  {entries.map((entry, index) => {
                    const automatic = isAutomaticEntry(entry);
                    const reversed = isReversedEntry(entry);
                    const canModify = isAdmin && !automatic;

                    const currencies = getEntryCurrencies(entry);

                    const isMultiCurrency = currencies.length > 1;

                    const primaryCurrency =
                      currencies.length === 1
                        ? currencies[0]
                        : entry.baseCurrency || "EGP";

                    const sourceLabel = getSourceTypeLabel(entry.sourceType);

                    return (
                      <motion.div
                        key={entry.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{
                          opacity: 0,
                          x: -8,
                        }}
                        transition={{
                          delay: Math.min(index * 0.02, 0.18),
                        }}
                        className={`
                          group
                          grid
                          grid-cols-[100px_105px_minmax(250px,1fr)_95px_100px_125px_125px_95px_105px]
                          items-center
                          gap-2
                          border-b
                          border-gray-50
                          px-4
                          py-3
                          text-sm
                          transition-all
                          duration-200
                          last:border-b-0
                          hover:bg-emerald-50/30
                          sm:px-6
                          ${isFetching ? "opacity-60" : ""}
                        `}
                      >
                        {/* Entry Number */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/journal-entries/${entry.id}`)
                          }
                          className="
                            w-fit
                            rounded-lg
                            px-2
                            py-1
                            text-xs
                            font-bold
                            tabular-nums
                            text-emerald-700
                            transition
                            hover:bg-emerald-50
                          "
                          title="عرض القيد"
                        >
                          {entry.entryNumber ?? "-"}
                        </button>

                        {/* Date */}

                        <span className="truncate text-xs tabular-nums text-gray-400">
                          {formatDate(entry.entryDate)}
                        </span>

                        {/* Description / Source */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/journal-entries/${entry.id}`)
                          }
                          className="
                            flex
                            min-w-0
                            flex-col
                            items-start
                            gap-1
                            text-right
                          "
                          title={entry.description}
                        >
                          <span
                            className="
                              flex
                              w-full
                              min-w-0
                              items-center
                              gap-2
                            "
                          >
                            <span
                              className="
                                min-w-0
                                truncate
                                font-medium
                                text-gray-800
                                transition
                                group-hover:text-emerald-700
                              "
                            >
                              {entry.description || "بدون بيان"}
                            </span>

                            <ChevronLeft
                              size={13}
                              className="
                                shrink-0
                                text-gray-300
                                opacity-0
                                transition
                                group-hover:opacity-100
                              "
                            />
                          </span>

                          {sourceLabel && (
                            <span
                              className="
                                inline-flex
                                max-w-full
                                items-center
                                gap-1.5
                                rounded-md
                                bg-gray-50
                                px-2
                                py-0.5
                                text-[9px]
                                font-medium
                                text-gray-400
                              "
                            >
                              <FileText size={10} />

                              {sourceLabel}

                              {entry.sourceNumber && (
                                <span className="font-bold text-gray-500">
                                  {entry.sourceNumber}
                                </span>
                              )}
                            </span>
                          )}
                        </button>

                        {/* Type */}

                        <span
                          className={`
                            w-fit
                            whitespace-nowrap
                            rounded-lg
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            ${
                              automatic
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                        >
                          {getEntryTypeLabel(entry.entryType)}
                        </span>

                        {/* Currency */}

                        <div className="flex items-center">
                          <CurrencyBadge
                            currency={primaryCurrency}
                            multi={isMultiCurrency}
                          />
                        </div>

                        {/* Debit */}

                        <div className="flex min-w-0 items-center justify-end gap-1.5">
                          <span
                            className="
                              truncate
                              text-left
                              text-sm
                              font-semibold
                              tabular-nums
                              text-gray-800
                            "
                          >
                            {money(entry.totalDebit)}
                          </span>

                          {primaryCurrency && !isMultiCurrency && (
                            <span className="text-[9px] font-semibold text-gray-400">
                              {primaryCurrency}
                            </span>
                          )}
                        </div>

                        {/* Credit */}

                        <div className="flex min-w-0 items-center justify-end gap-1.5">
                          <span
                            className="
                              truncate
                              text-left
                              text-sm
                              font-semibold
                              tabular-nums
                              text-gray-800
                            "
                          >
                            {money(entry.totalCredit)}
                          </span>

                          {primaryCurrency && !isMultiCurrency && (
                            <span className="text-[9px] font-semibold text-gray-400">
                              {primaryCurrency}
                            </span>
                          )}
                        </div>

                        {/* Status */}

                        <span
                          className={`
                            w-fit
                            whitespace-nowrap
                            rounded-lg
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            ${
                              reversed
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-700"
                            }
                          `}
                        >
                          {getStatusLabel(entry.status)}
                        </span>

                        {/* Actions */}

                        <div className="flex justify-end gap-1">
                          {canModify ? (
                            <>
                              <motion.button
                                type="button"
                                whileTap={{
                                  scale: 0.9,
                                }}
                                onClick={() =>
                                  navigate(
                                    `/dashboard/journal-entries/${entry.id}/edit`,
                                  )
                                }
                                title="تعديل"
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  text-gray-400
                                  transition-all
                                  hover:bg-emerald-50
                                  hover:text-emerald-700
                                "
                              >
                                <Pencil size={15} />
                              </motion.button>

                              <motion.button
                                type="button"
                                whileTap={{
                                  scale: 0.9,
                                }}
                                disabled={isDeleting}
                                onClick={() => handleDelete(entry)}
                                title="حذف"
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  text-gray-400
                                  transition-all
                                  hover:bg-red-50
                                  hover:text-red-600
                                  disabled:opacity-40
                                "
                              >
                                {isDeleting ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </motion.button>
                            </>
                          ) : (
                            <motion.button
                              type="button"
                              whileTap={{
                                scale: 0.9,
                              }}
                              onClick={() =>
                                navigate(
                                  `/dashboard/journal-entries/${entry.id}`,
                                )
                              }
                              title="عرض"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-gray-400
                                transition-all
                                hover:bg-gray-100
                                hover:text-gray-800
                              "
                            >
                              <Eye size={16} />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Empty */}

              {!isLoading && entries.length === 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    flex
                    min-h-[330px]
                    flex-col
                    items-center
                    justify-center
                    px-6
                    py-14
                    text-center
                  "
                >
                  <div
                    className="
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gray-100
                      text-gray-400
                    "
                  >
                    <FileText size={26} />
                  </div>

                  <h3 className="mb-1 text-sm font-semibold text-gray-700">
                    لا توجد قيود مطابقة
                  </h3>

                  <p className="max-w-sm text-xs leading-5 text-gray-400">
                    لم يتم العثور على قيود تطابق معايير البحث والتصفية الحالية.
                  </p>

                  {hasActiveFilters && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={resetFilters}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-3.5
                        py-2
                        text-xs
                        font-medium
                        text-gray-600
                        shadow-sm
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <RotateCcw size={13} />
                      إعادة ضبط الفلاتر
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            Pagination
        ================================================= */}

        {data?.totalCount > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={data.totalCount}
            totalPages={data?.totalPages ?? 1}
            isFetching={isFetching}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            label="قيد"
          />
        )}
      </motion.div>

      {/* =================================================
          Hidden Print Content
      ================================================= */}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <JournalEntriesListPrintTemplate
            entries={entries}
            filters={{
              ...filters,
              fiscalYearName: selectedFiscalYear?.label,
            }}
            summary={summary}
          />
        </div>
      </div>
    </>
  );
}
