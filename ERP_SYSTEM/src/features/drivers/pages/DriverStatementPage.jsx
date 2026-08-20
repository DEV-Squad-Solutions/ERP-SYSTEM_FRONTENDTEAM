// features/drivers/pages/DriverStatementPage.jsx

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  RefreshCw,
  FileSearch,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Wallet,
  TrendingUp,
  TrendingDown,
  Truck,
  UserPlus,
  Printer,
} from "lucide-react";

import {
  useGetDriverStatementQuery,
  useGetDriversSelectQuery,
} from "../driversApi";

import { useGetCashMovementTypeOptionsQuery } from "../../cashboxes/cashMovementTypesApi";
import QuickAddDriverModal from "../components/QuickAddDriverModal";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const directionOptions = [
  { value: "Receipt", label: "وارد" },
  { value: "Payment", label: "صادر" },
];

const hasCostOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "بها تكلفة" },
  { value: "false", label: "بدون تكلفة" },
];

const emptyFilters = {
  search: "",
  fromDate: "",
  toDate: "",
  direction: "",
  cashMovementTypeId: "",
  driverTripId: "",
  invoiceNumber: "",
  transactionsWithoutTrip: false,
  hasCost: "",
};

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

function BalanceBadge({ description }) {
  const isOwedByDriver = description?.includes("مطلوب من السائق");
  const isOwedToDriver = description?.includes("مطلوب دفعه");

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
        isOwedByDriver
          ? "text-positive bg-positive/10"
          : isOwedToDriver
            ? "text-negative bg-negative/10"
            : "text-ink-400 bg-ink-400/10"
      }`}
    >
      {description}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone,
  highlight,
  icon: Icon,
}) {
  return (
    <div
      className={`group relative rounded-xl border px-3 py-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${
        highlight
          ? "border-primary-200 bg-gradient-to-br from-primary-500/[0.06] to-primary-500/[0.02]"
          : "border-ink-400/10 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className="text-[11px] text-ink-400 truncate">{label}</p>

        {Icon && (
          <div
            className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center ${
              tone === "negative"
                ? "bg-negative/10 text-negative"
                : tone === "positive"
                  ? "bg-positive/10 text-positive"
                  : "bg-ink-900/[0.05] text-ink-400"
            }`}
          >
            <Icon size={12} />
          </div>
        )}
      </div>

      <p
        className={`text-[15px] font-bold num leading-5 ${
          tone === "negative"
            ? "text-negative"
            : tone === "positive"
              ? "text-positive"
              : "text-ink-900"
        }`}
      >
        {value}
      </p>

      {description && (
        <p
          className="text-[10px] text-ink-400 mt-0.5 truncate leading-4"
          title={description}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function DriverStatementPage() {
  const [driverId, setDriverId] = useState("");
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);

  const {
    data: drivers,
    isLoading: isLoadingDrivers,
    isError: isDriversError,
    refetch: refetchDrivers,
  } = useGetDriversSelectQuery();

  const {
    data: movementTypeOptions,
    isLoading: isLoadingMovementTypes,
    isError: isMovementTypesError,
    refetch: refetchMovementTypes,
  } = useGetCashMovementTypeOptionsQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDriverStatementQuery(
      {
        DriverId: driverId,
        PageNumber: page,
        PageSize: pageSize,
        Search: applied.search || undefined,
        FromDate: applied.fromDate || undefined,
        ToDate: applied.toDate || undefined,
        Direction: applied.direction || undefined,
        CashMovementTypeId: applied.cashMovementTypeId || undefined,
        DriverTripId: applied.driverTripId || undefined,
        InvoiceNumber: applied.invoiceNumber || undefined,
        TransactionsWithoutTrip: applied.transactionsWithoutTrip || undefined,
        HasCost:
          applied.hasCost === "" ? undefined : applied.hasCost === "true",
      },
      {
        skip: !driverId,
      },
    );

  const setField = (key, value) => {
    setDraft((d) => ({
      ...d,
      [key]: value,
    }));
  };

  const handleDriverChange = (id) => {
    setDriverId(id);
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
    setFiltersOpen(false);
  };

  const handleDriverCreated = (newDriver) => {
    setShowAddDriver(false);
    handleDriverChange(newDriver.id);
  };

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeFiltersCount = useMemo(
    () =>
      Object.entries(applied).filter(([key, value]) => {
        if (key === "transactionsWithoutTrip") {
          return value === true;
        }

        return value !== "" && value !== undefined && value !== null;
      }).length,
    [applied],
  );

  const rows = data?.items || [];
  const summary = data?.summary;

  const selectedDriverName =
    drivers?.find((d) => d.id === driverId)?.name || "";

  return (
    <div className="animate-fadeUp space-y-3">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col xl:flex-row xl:items-center gap-3 print:hidden">
        <div className="flex items-center gap-2.5 min-w-0 xl:flex-1">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
            <Truck size={17} />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-ink-900 leading-6">
              كشف حساب السائقين
            </h2>

            <p className="text-[11px] text-ink-400 mt-0.5 truncate">
              المدفوع والمستلم وتكاليف الرحلات
            </p>
          </div>
        </div>

        {/* اختيار السائق */}

        <div className="flex items-center gap-2 flex-1 xl:max-w-[420px]">
          <div className="flex-1 min-w-0">
            <CompactSelect
              label="السائق"
              options={
                drivers?.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) || []
              }
              value={driverId}
              onChange={handleDriverChange}
              isLoading={isLoadingDrivers}
              isDisabled={isDriversError}
              placeholder={
                isDriversError
                  ? "تعذر تحميل السائقين"
                  : isLoadingDrivers
                    ? "جارِ التحميل..."
                    : "اختر السائق"
              }
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddDriver(true)}
            className="shrink-0 w-9 h-9 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center"
            title="إضافة سائق جديد"
          >
            <UserPlus size={17} />
          </button>
        </div>

        {/* Actions */}

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={!driverId || isFetching}
            className="h-9 px-3"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!driverId || rows.length === 0}
            className="h-9 px-3"
          >
            <Printer size={14} />
            طباعة
          </Button>
        </div>
      </div>

      {isDriversError && (
        <button
          type="button"
          onClick={refetchDrivers}
          className="inline-flex items-center gap-1 text-[11px] text-negative hover:underline print:hidden"
        >
          <AlertCircle size={11} />
          تعذر تحميل قائمة السائقين، أعد المحاولة
        </button>
      )}

      {!driverId ? (
        <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
          <div className="w-12 h-12 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-2.5">
            <Truck size={21} className="text-ink-400/50" strokeWidth={1.6} />
          </div>

          <p className="text-sm text-ink-400">اختر سائق لعرض كشف حسابه</p>
        </div>
      ) : (
        <>
          {/* ================= PRINT HEADER ================= */}

          <div className="hidden print:block mb-2">
            <h2 className="text-xl font-bold text-ink-900">
              كشف حساب — {selectedDriverName}
            </h2>

            <p className="text-xs text-ink-400">
              {applied.fromDate || "—"} إلى {applied.toDate || "—"}
            </p>
          </div>

          {/* ================= FILTERS ================= */}

          <div className="bg-white rounded-xl border border-ink-400/10 shadow-card overflow-hidden print:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-ink-900/[0.015]"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-ink-400" />

                <span className="text-xs font-medium text-ink-900">
                  الفلاتر
                </span>

                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-primary-500 text-white text-[9px] font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <ChevronDown
                size={15}
                className={`text-ink-400 transition-transform duration-300 ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-3.5 pb-3 pt-1 border-t border-ink-400/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 mt-2.5">
                    <Input
                      label="بحث"
                      value={draft.search}
                      onChange={(e) => setField("search", e.target.value)}
                      placeholder="ابحث..."
                    />

                    <Input
                      label="من تاريخ"
                      type="date"
                      value={draft.fromDate}
                      onChange={(e) => setField("fromDate", e.target.value)}
                    />

                    <Input
                      label="إلى تاريخ"
                      type="date"
                      value={draft.toDate}
                      onChange={(e) => setField("toDate", e.target.value)}
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-ink-400 mb-1">
                        اتجاه الحركة
                      </label>

                      <CompactSelect
                        options={directionOptions}
                        value={draft.direction}
                        onChange={(val) => setField("direction", val)}
                        placeholder="الكل"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink-400 mb-1">
                        نوع الحركة
                      </label>

                      <CompactSelect
                        options={
                          movementTypeOptions?.map((t) => ({
                            value: t.id,
                            label: t.name,
                          })) || []
                        }
                        value={draft.cashMovementTypeId}
                        onChange={(val) => setField("cashMovementTypeId", val)}
                        isLoading={isLoadingMovementTypes}
                        isDisabled={isMovementTypesError}
                        placeholder={
                          isMovementTypesError
                            ? "تعذر التحميل"
                            : isLoadingMovementTypes
                              ? "جارِ التحميل..."
                              : "الكل"
                        }
                      />

                      {isMovementTypesError && (
                        <button
                          type="button"
                          onClick={refetchMovementTypes}
                          className="inline-flex items-center gap-1 text-[10px] text-negative hover:underline mt-1"
                        >
                          <AlertCircle size={10} />
                          أعد المحاولة
                        </button>
                      )}
                    </div>

                    <Input
                      label="رقم الرحلة"
                      type="number"
                      value={draft.driverTripId}
                      onChange={(e) => setField("driverTripId", e.target.value)}
                    />

                    <Input
                      label="رقم الفاتورة"
                      value={draft.invoiceNumber}
                      onChange={(e) =>
                        setField("invoiceNumber", e.target.value)
                      }
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-ink-400 mb-1">
                        تكلفة الرحلة
                      </label>

                      <CompactSelect
                        options={hasCostOptions}
                        value={draft.hasCost}
                        onChange={(val) => setField("hasCost", val)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2.5 pt-2.5 border-t border-ink-400/10">
                    <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={draft.transactionsWithoutTrip}
                        onChange={(e) =>
                          setField("transactionsWithoutTrip", e.target.checked)
                        }
                        className="rounded border-ink-400/30 accent-primary-500"
                      />
                      سندات عامة بدون رحلة فقط
                    </label>

                    <div className="flex gap-2">
                      <Button onClick={handleSearch} className="h-8 px-3">
                        <Search size={13} />
                        بحث
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="h-8 px-3"
                      >
                        <RotateCcw size={13} />
                        تصفير
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SUMMARY ================= */}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[68px] rounded-xl bg-ink-400/5 animate-pulse"
                  style={{
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
          ) : (
            summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 animate-fadeUp">
                <SummaryCard
                  label="رصيد أول المدة"
                  value={fmt(summary.openingBalanceAmount)}
                  description={summary.openingBalanceDescription}
                  icon={Wallet}
                />

                <SummaryCard
                  label="إجمالي المدفوع للسائق"
                  value={fmt(summary.totalPaidToDriver)}
                  tone="negative"
                  icon={TrendingDown}
                />

                <SummaryCard
                  label="إجمالي المستلم منه"
                  value={fmt(summary.totalReceivedFromDriver)}
                  tone="positive"
                  icon={TrendingUp}
                />

                <SummaryCard
                  label="إجمالي تكلفة الرحلات"
                  value={fmt(summary.totalTripCost)}
                  icon={Truck}
                />

                <SummaryCard
                  label="رصيد آخر المدة"
                  value={fmt(summary.closingBalanceAmount)}
                  description={summary.closingBalanceDescription}
                  icon={Wallet}
                  highlight
                />
              </div>
            )
          )}

          {/* ================= TABLE ================= */}

          {isLoading ? (
            <div className="rounded-xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
              <div className="h-9 bg-ink-900/[0.03] border-b border-ink-400/10" />

              <div className="divide-y divide-ink-400/5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2.5 py-2"
                    style={{
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="h-3 w-14 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 w-28 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 flex-1 max-w-[160px] rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-ink-400/10 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-12 border border-dashed border-negative/25 bg-negative/[0.02] rounded-xl animate-fadeUp">
              <AlertCircle
                size={29}
                className="mx-auto text-negative/70 mb-2.5"
                strokeWidth={1.6}
              />

              <p className="text-ink-900 font-medium text-sm mb-1">
                حدث خطأ في تحميل الكشف
              </p>

              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-3.5 py-1.5 rounded-lg transition-colors mt-2"
              >
                <RefreshCw size={12} />
                إعادة المحاولة
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-ink-400/20 rounded-xl animate-fadeUp">
              <FileSearch
                size={21}
                className="mx-auto text-ink-400/50 mb-2.5"
                strokeWidth={1.6}
              />

              <p className="text-ink-900 font-medium text-sm mb-1">
                لا توجد حركات مطابقة
              </p>

              <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
            </div>
          ) : (
            <>
              <div
                className={`overflow-x-auto custom-scroll rounded-xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 print:overflow-visible print:border-0 print:shadow-none ${
                  isFetching ? "opacity-60" : ""
                }`}
              >
                <table className="w-full text-right border-collapse min-w-[1180px] print:min-w-0">
                  <thead>
                    <tr className="bg-ink-900/[0.03] text-ink-400 text-[10px] print:bg-transparent print:text-ink-600">
                      {/* الرصيد */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        الرصيد
                      </th>

                      {/* المدفوع للسائق */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 text-negative whitespace-nowrap">
                        مدفوع للسائق
                      </th>

                      {/* المستلم منه */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 text-positive whitespace-nowrap">
                        مستلم منه
                      </th>

                      {/* البلد */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        البلد
                      </th>

                      {/* الخزنة */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        الخزنة
                      </th>

                      {/* البيان */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 min-w-[180px]">
                        البيان
                      </th>

                      {/* الرحلة */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        الرحلة
                      </th>

                      {/* الفاتورة */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        الفاتورة
                      </th>

                      {/* العميل */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 min-w-[120px]">
                        العميل
                      </th>

                      {/* الحركة */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        الحركة
                      </th>

                      {/* المستند */}
                      <th className="px-2 py-2 font-medium border-l border-ink-400/5 whitespace-nowrap">
                        المستند
                      </th>

                      {/* التاريخ */}
                      <th className="px-2 py-2 font-medium whitespace-nowrap">
                        التاريخ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={`${row.sourceId}-${row.date}-${idx}`}
                        className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp print:hover:bg-transparent"
                        style={{
                          animationDelay: `${Math.min(idx, 12) * 25}ms`,
                        }}
                      >
                        {/* الرصيد */}
                        <td className="px-2 py-2 border-l border-ink-400/5">
                          <div className="flex flex-col gap-0.5">
                            <span className="num font-semibold text-[12px] text-ink-900">
                              {fmt(row.balanceAmount)}
                            </span>

                            {row.balanceDescription && (
                              <BalanceBadge
                                description={row.balanceDescription}
                              />
                            )}
                          </div>
                        </td>

                        {/* المدفوع للسائق */}
                        <td className="px-2 py-2 num text-negative text-[12px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.amountPaidToDriver > 0
                            ? fmt(row.amountPaidToDriver)
                            : "—"}
                        </td>

                        {/* المستلم منه */}
                        <td className="px-2 py-2 num text-positive text-[12px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.amountReceivedFromDriver > 0
                            ? fmt(row.amountReceivedFromDriver)
                            : "—"}
                        </td>

                        {/* البلد */}
                        <td className="px-2 py-2 text-[11px] text-ink-600 border-l border-ink-400/5 whitespace-nowrap">
                          {row.countryName || "—"}
                        </td>

                        {/* الخزنة */}
                        <td className="px-2 py-2 text-ink-600 text-[11px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.cashboxName || "—"}
                        </td>

                        {/* البيان */}
                        <td
                          className="px-2 py-2 text-ink-700 text-[11px] max-w-[220px] truncate border-l border-ink-400/5"
                          title={row.description}
                        >
                          {row.description || "—"}
                        </td>

                        {/* الرحلة */}
                        <td className="px-2 py-2 num text-[12px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.driverTripNumber ? (
                            <Link
                              to={`/dashboard/drivers/trip-costs?driverId=${driverId}&tripNumber=${row.driverTripNumber}`}
                              className="text-primary-500 hover:text-primary-600 hover:underline transition-colors print:no-underline print:text-ink-900"
                              title="عرض/تعديل تكلفة الرحلة"
                            >
                              {row.driverTripNumber}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* الفاتورة */}
                        <td className="px-2 py-2 text-[12px] font-medium num border-l border-ink-400/5 whitespace-nowrap">
                          {row.invoiceNumber || "—"}
                        </td>

                        {/* العميل */}
                        <td className="px-2 py-2 text-[11px] border-l border-ink-400/5">
                          {row.businessPartnerId && row.businessPartnerName ? (
                            <Link
                              to={`/dashboard/partners/${row.businessPartnerId}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                            >
                              {row.businessPartnerName}
                            </Link>
                          ) : (
                            <span className="text-ink-400">—</span>
                          )}
                        </td>

                        {/* الحركة */}
                        <td className="px-2 py-2 text-ink-600 text-[11px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.movementName || "—"}
                        </td>

                        {/* المستند */}
                        <td className="px-2 py-2 num text-ink-900 text-[12px] border-l border-ink-400/5 whitespace-nowrap">
                          {row.documentNumber || "—"}
                        </td>

                        {/* التاريخ */}
                        <td className="px-2 py-2 num text-ink-600 text-[12px] whitespace-nowrap">
                          {row.date || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data?.totalCount > 0 && (
                <div className="print:hidden">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalCount={data.totalCount}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      <QuickAddDriverModal
        isOpen={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        onCreated={handleDriverCreated}
      />
    </div>
  );
}
