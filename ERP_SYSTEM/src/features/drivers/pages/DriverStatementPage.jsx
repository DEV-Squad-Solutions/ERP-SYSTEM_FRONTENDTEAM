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
  User,
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
import QuickAddDriverModal from "../components/QuickAddDriverModal"; // عدّل المسار حسب مكانه عندك
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";
import { useNavigate } from "react-router-dom";
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
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
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
      className={`group relative rounded-2xl border p-3.5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${
        highlight
          ? "border-primary-200 bg-gradient-to-br from-primary-500/[0.06] to-primary-500/[0.02]"
          : "border-ink-400/10 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-xs text-ink-400">{label}</p>
        {Icon && (
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              tone === "negative"
                ? "bg-negative/10 text-negative"
                : tone === "positive"
                  ? "bg-positive/10 text-positive"
                  : "bg-ink-900/[0.05] text-ink-400"
            }`}
          >
            <Icon size={13} />
          </div>
        )}
      </div>
      <p
        className={`text-base font-bold num ${
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
          className="text-[11px] text-ink-400 mt-0.5 truncate"
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
  const navigate = useNavigate();
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
      { skip: !driverId },
    );

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

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
        if (key === "transactionsWithoutTrip") return value === true;
        return value !== "" && value !== undefined && value !== null;
      }).length,
    [applied],
  );

  const rows = data?.items || [];
  const summary = data?.summary;

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            كشف حساب السائقين
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            المدفوع والمستلم من السائق وتكاليف الرحلات في كشف واحد
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={!driverId || isFetching}
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!driverId || rows.length === 0}
          >
            <Printer size={16} />
            طباعة
          </Button>
        </div>
      </div>

      {/* اختيار السائق */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 transition-shadow hover:shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1  ">
            <CompactSelect
              label="السائق"
              options={
                drivers?.map((d) => ({ value: d.id, label: d.name })) || []
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
            {isDriversError && (
              <button
                type="button"
                onClick={refetchDrivers}
                className="inline-flex items-center gap-1 text-[11px] text-negative hover:underline mt-1"
              >
                <AlertCircle size={11} />
                تعذر تحميل قائمة السائقين، أعد المحاولة
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAddDriver(true)}
            className="shrink-0 p-2.5 rounded-xl text-primary-500 hover:bg-primary-50 transition-colors"
            title="إضافة سائق جديد"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      {!driverId ? (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
          <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
            <Truck size={24} className="text-ink-400/50" strokeWidth={1.6} />
          </div>
          <p className="text-ink-400">اختر سائق لعرض كشف حسابه</p>
        </div>
      ) : (
        <>
          {/* رأس التقرير - يظهر بس عند الطباعة */}
          <div className="hidden print:block mb-2">
            <h2 className="text-xl font-bold text-ink-900">
              كشف حساب — {drivers?.find((d) => d.id === driverId)?.name}
            </h2>
            <p className="text-xs text-ink-400">
              {applied.fromDate || "—"} إلى {applied.toDate || "—"}
            </p>
          </div>

          {/* زرار فتح الفلاتر */}
          <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card overflow-hidden transition-shadow hover:shadow-md print:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-ink-900/[0.015]"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-ink-400" />
                <span className="text-sm font-medium text-ink-900">
                  الفلاتر
                </span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
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
                <div className="px-4 pb-4 pt-1 border-t border-ink-400/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
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
                      <label className="block text-xs font-medium text-ink-400 mb-1">
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
                      <label className="block text-xs font-medium text-ink-400 mb-1">
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
                          className="inline-flex items-center gap-1 text-[11px] text-negative hover:underline mt-1"
                        >
                          <AlertCircle size={11} />
                          تعذر تحميل الأنواع، أعد المحاولة
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
                      <label className="block text-xs font-medium text-ink-400 mb-1">
                        تكلفة الرحلة
                      </label>
                      <CompactSelect
                        options={hasCostOptions}
                        value={draft.hasCost}
                        onChange={(val) => setField("hasCost", val)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-400/10">
                    <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none">
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
                      <Button onClick={handleSearch} className="h-9">
                        <Search size={14} />
                        بحث
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="h-9"
                      >
                        <RotateCcw size={14} />
                        تصفير
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ملخص الرصيد */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[74px] rounded-2xl bg-ink-400/5 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          ) : (
            summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-fadeUp">
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

          {/* الجدول */}
          {isLoading ? (
            <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
              <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
              <div className="divide-y divide-ink-400/5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-3 py-3"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 w-14 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 flex-1 max-w-[150px] rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 w-24 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
                    <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl animate-fadeUp">
              <AlertCircle
                size={32}
                className="mx-auto text-negative/70 mb-3"
                strokeWidth={1.6}
              />
              <p className="text-ink-900 font-medium text-sm mb-1">
                حدث خطأ في تحميل الكشف
              </p>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
              >
                <RefreshCw size={13} />
                إعادة المحاولة
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
              <FileSearch
                size={22}
                className="mx-auto text-ink-400/50 mb-3"
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
                className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 print:overflow-visible print:border-0 print:shadow-none ${isFetching ? "opacity-60" : ""}`}
              >
                <table className="w-full text-right border-collapse min-w-[1200px] print:min-w-0">
                  <thead>
                    <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px] print:bg-transparent print:text-ink-600">
                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        التاريخ
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        المستند
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        العميل
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        الحركة
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        البيان
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        رقم الرحلة
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        رقم الفاتورة
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5 text-negative">
                        مدفوع للسائق
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5 text-positive">
                        مستلم منه
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        تكلفة الرحلة
                      </th>

                      <th className="p-2.5 font-medium border-l border-ink-400/5">
                        الرصيد
                      </th>

                      <th className="p-2.5 font-medium">الخزنة</th>
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
                        {/* التاريخ */}
                        <td className="p-2.5 num text-ink-600 text-[13px] whitespace-nowrap border-l border-ink-400/5">
                          {row.date || "—"}
                        </td>

                        {/* المستند */}
                        <td className="p-2.5 num text-ink-900 text-[13px] border-l border-ink-400/5">
                          {row.documentNumber || "—"}
                        </td>

                        {/* العميل */}
                        <td className="p-2.5 text-xs border-l border-ink-400/5">
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
                        <td className="p-2.5 text-ink-600 text-xs border-l border-ink-400/5">
                          {row.movementName || "—"}
                        </td>

                        {/* البيان */}
                        <td
                          className="p-2.5 text-ink-700 text-xs max-w-[180px] truncate border-l border-ink-400/5"
                          title={row.description}
                        >
                          {row.description || "—"}
                        </td>

                        {/* رقم الرحلة */}
                        <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
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

                        {/* رقم الفاتورة */}
                        <td className="p-2.5 text-sm font-medium num border-l border-ink-400/5">
                          {row.invoiceNumber || "—"}
                        </td>

                        {/* مدفوع للسائق */}
                        <td className="p-2.5 num text-negative text-[13px] border-l border-ink-400/5">
                          {row.amountPaidToDriver > 0
                            ? fmt(row.amountPaidToDriver)
                            : "—"}
                        </td>

                        {/* مستلم منه */}
                        <td className="p-2.5 num text-positive text-[13px] border-l border-ink-400/5">
                          {row.amountReceivedFromDriver > 0
                            ? fmt(row.amountReceivedFromDriver)
                            : "—"}
                        </td>

                        {/* تكلفة الرحلة */}
                        <td className="p-2.5 num text-ink-900 text-[13px] border-l border-ink-400/5">
                          {row.tripCost > 0 ? fmt(row.tripCost) : "—"}
                        </td>

                        {/* الرصيد */}
                        <td className="p-2.5 border-l border-ink-400/5">
                          <div className="flex flex-col gap-0.5">
                            <span className="num font-semibold text-[13px] text-ink-900">
                              {fmt(row.balanceAmount)}
                            </span>

                            {row.balanceDescription && (
                              <BalanceBadge
                                description={row.balanceDescription}
                              />
                            )}
                          </div>
                        </td>

                        {/* الخزنة */}
                        <td className="p-2.5 text-ink-600 text-xs">
                          {row.cashboxName || "—"}
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
