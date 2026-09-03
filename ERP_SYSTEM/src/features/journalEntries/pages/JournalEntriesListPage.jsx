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
  Filter,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
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

function isAutomaticEntry(entry) {
  return (
    entry?.entryType === "Automatic" ||
    entry?.entryType === 4 ||
    entry?.entryType === "4"
  );
}

// =========================================================
// Animation
// =========================================================

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 10,
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

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 7,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: "easeOut",
    },
  },
};

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

    return {
      totalDebit,
      totalCredit,
      difference: totalDebit - totalCredit,
      count: entries.length,
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
      {/* ===================================================
          Visible Page
      =================================================== */}

      <motion.div
        dir="rtl"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="
          min-h-screen
          w-full
          max-w-full
          overflow-x-hidden
          bg-gray-50
          px-3
          py-4
          sm:px-5
          sm:py-5
          lg:px-8
          lg:py-6
        "
      >
        {/* Header */}

        <div
          className="
            mb-6
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-700
                "
              >
                <BookOpen size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  قيود اليومية
                </h1>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  إدارة ومراجعة القيود المحاسبية اليومية
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Refresh */}

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => refetch()}
              disabled={isFetching}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
              "
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </motion.button>

            {/* Print */}

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={printList}
              disabled={isLoading || entries.length === 0}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
            >
              <Printer size={16} />
              طباعة
            </motion.button>

            {/* New */}

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/dashboard/journal-entries/new")}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-emerald-800
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-emerald-900
                sm:w-auto
              "
            >
              <Plus size={17} />
              قيد جديد
            </motion.button>
          </div>
        </div>

        {/* Filters */}

        <div
          className="
            mb-5
            w-full
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
              py-3
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-gray-100
                  text-gray-600
                "
              >
                <Filter size={16} />
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
              <button
                type="button"
                onClick={resetFilters}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-gray-500
                  transition
                  hover:text-red-600
                "
              >
                <RotateCcw size={14} />
                إعادة ضبط
              </button>
            )}
          </div>

          <div className="p-4 sm:p-5">
            <div
              className="
                grid
                grid-cols-1
                gap-4
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
                    placeholder="رقم القيد، البيان..."
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50/50
                      py-2.5
                      pr-9
                      pl-9
                      text-sm
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-2
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
                        -translate-y-1/2
                        text-gray-400
                        hover:text-gray-700
                      "
                    >
                      <X size={15} />
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
                      w-full
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50/50
                      px-3
                      py-2.5
                      pr-9
                      text-sm
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-2
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
                      w-full
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50/50
                      px-3
                      py-2.5
                      pr-9
                      text-sm
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-2
                      focus:ring-emerald-500/10
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Title */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-gray-400" />

            <span className="text-sm font-semibold text-gray-700">
              القيود اليومية
            </span>

            {data?.totalCount != null && (
              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  text-emerald-700
                "
              >
                {data.totalCount.toLocaleString("ar-EG")}
              </span>
            )}
          </div>

          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <RefreshCw size={13} className="animate-spin" />
              جاري التحديث...
            </div>
          )}
        </div>

        {/* Table */}

        <div
          className="
            w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div className="w-full overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Header */}

              <div
                className="
                  grid
                  grid-cols-[100px_minmax(240px,1fr)_110px_110px_120px_120px_110px]
                  gap-2
                  border-b
                  border-gray-100
                  bg-gray-50/70
                  px-4
                  py-3
                  text-[11px]
                  font-semibold
                  text-gray-400
                  sm:px-6
                "
              >
                <span>التاريخ</span>

                <span>البيان</span>

                <span>النوع</span>

                <span>الحالة</span>

                <span className="text-left">مدين</span>

                <span className="text-left">دائن</span>

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
                          grid-cols-[100px_minmax(240px,1fr)_110px_110px_120px_120px_110px]
                          items-center
                          gap-2
                          px-4
                          py-4
                          sm:px-6
                        "
                    >
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />

                      <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />

                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />

                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />

                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100" />

                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100" />

                      <div className="ml-auto h-8 w-16 animate-pulse rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* Rows */}

              {!isLoading && (
                <AnimatePresence mode="popLayout">
                  {entries.map((entry, index) => {
                    const automatic = isAutomaticEntry(entry);

                    const canModify = isAdmin && !automatic;

                    return (
                      <motion.div
                        key={entry.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{
                          opacity: 0,
                          x: -10,
                        }}
                        transition={{
                          delay: Math.min(index * 0.025, 0.2),
                        }}
                        className={`
                          grid
                          grid-cols-[100px_minmax(240px,1fr)_110px_110px_120px_120px_110px]
                          items-center
                          gap-2
                          border-b
                          border-gray-50
                          px-4
                          py-3.5
                          text-sm
                          transition-colors
                          last:border-b-0
                          hover:bg-emerald-50/30
                          sm:px-6
                          ${isFetching ? "opacity-60" : ""}
                        `}
                      >
                        {/* Date */}

                        <span className="truncate text-xs text-gray-500">
                          {entry.entryDate ?? "-"}
                        </span>

                        {/* Description */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/journal-entries/${entry.id}`)
                          }
                          className="
                            min-w-0
                            truncate
                            text-right
                            font-medium
                            text-gray-800
                            transition
                            hover:text-emerald-700
                          "
                          title={entry.description}
                        >
                          {entry.description || "بدون بيان"}
                        </button>

                        {/* Type */}

                        <span
                          className={`
                            w-fit
                            whitespace-nowrap
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            ${
                              automatic
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {getEntryTypeLabel(entry.entryType)}
                        </span>

                        {/* Status */}

                        <span
                          className={`
                            w-fit
                            whitespace-nowrap
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-medium
                            ${
                              entry.status === "Reversed" ||
                              entry.status === 2 ||
                              entry.status === "2"
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-700"
                            }
                          `}
                        >
                          {typeof entry.status === "number"
                            ? ({
                                1: "مرحّل",
                                2: "معكوس",
                              }[entry.status] ?? entry.status)
                            : ({
                                Posted: "مرحّل",
                                Reversed: "معكوس",
                              }[entry.status] ??
                              entry.status ??
                              "-")}
                        </span>

                        {/* Debit */}

                        <span className="truncate text-left text-sm font-medium tabular-nums text-gray-800">
                          {money(entry.totalDebit)}
                        </span>

                        {/* Credit */}

                        <span className="truncate text-left text-sm font-medium tabular-nums text-gray-800">
                          {money(entry.totalCredit)}
                        </span>

                        {/* Actions */}

                        <div className="flex justify-end gap-1.5">
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
                                  transition
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
                                  transition
                                  hover:bg-red-50
                                  hover:text-red-600
                                  disabled:opacity-40
                                "
                              >
                                {isDeleting ? (
                                  <RefreshCw
                                    size={15}
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
                                transition
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
                      flex-col
                      items-center
                      justify-center
                      px-6
                      py-16
                      text-center
                    "
                >
                  <div
                    className="
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gray-100
                        text-gray-400
                      "
                  >
                    <FileText size={25} />
                  </div>

                  <h3 className="mb-1 text-sm font-semibold text-gray-700">
                    لا توجد قيود مطابقة
                  </h3>

                  <p className="text-xs text-gray-400">
                    جرّب تغيير الفلاتر أو معايير البحث.
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="
                          mt-4
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-gray-200
                          px-3
                          py-2
                          text-xs
                          font-medium
                          text-gray-600
                          transition
                          hover:bg-gray-50
                        "
                    >
                      <RotateCcw size={13} />
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}

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

      {/* ===================================================
          Hidden Print Content
      =================================================== */}

      {/* ===================================================
    Hidden Print Content
=================================================== */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "297mm",
          minHeight: "210mm",
          background: "#fff",
          zIndex: -9999,
          pointerEvents: "none",
        }}
      >
        <JournalEntriesListPrintTemplate
          entries={entries}
          filters={{
            ...filters,
            fiscalYearName: selectedFiscalYear?.label,
          }}
          summary={summary}
        />
      </div>
    </>
  );
}
