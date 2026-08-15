import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  ArrowRight,
  Printer,
  Search,
  RotateCcw,
  Filter,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useGetCashboxByIdQuery } from "../cashboxesApi";
import {
  useGetCashVouchersQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
} from "../cashVouchersApi";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";

import CashboxLedgerTable from "../components/CashboxLedgerTable";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

import { useCashboxLedgerPrint } from "../../../shared/hooks/useCashboxLedgerPrint";
import CashboxLedgerPrintTemplate from "../../../shared/components/print/CashboxLedgerPrintTemplate";

const currencySymbols = {
  EGP: "ج.م",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  KWD: "د.ك",
};

const emptyFilters = {
  Search: "",
  VoucherNumber: "",
  Direction: "",
  CashMovementTypeId: "",
  PartyType: "",
  BusinessPartnerId: "",
  DriverId: "",
  DriverTripId: "",
  IsDraft: "",
  FromDate: "",
  ToDate: "",
};

const directionOptions = [
  { value: "Receipt", label: "وارد" },
  { value: "Payment", label: "صادر" },
];

const partyTypeOptions = [
  { value: "None", label: "بدون طرف" },
  { value: "Partner", label: "شريك" },
  { value: "Driver", label: "سائق" },
  { value: "Other", label: "طرف آخر" },
];

const draftOptions = [
  { value: "true", label: "مسودة" },
  { value: "false", label: "مرحل" },
];

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    draft: { ...emptyFilters },
    applied: { ...emptyFilters },
  });

  const [filtersOpen, setFiltersOpen] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId);

  const { data: parties, isLoading: isLoadingParties } =
    useGetPartiesSelectQuery();

  const { data: drivers, isLoading: isLoadingDrivers } =
    useGetDriversSelectQuery();

  const [createVoucher] = useCreateCashVoucherMutation();
  const [updateVoucher] = useUpdateCashVoucherMutation();

  /*
   * تجهيز Parameters للـ API
   *
   * cashboxId إجباري لأننا داخل خزنة معينة.
   * باقي الفلاتر لا يتم إرسالها لو قيمتها فارغة.
   */
  const queryParams = useMemo(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters.applied).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

    return {
      cashboxId,
      pageNumber: page,
      pageSize,
      ...activeFilters,
    };
  }, [cashboxId, page, pageSize, filters.applied]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery(queryParams);

  const cashboxCurrency = cashbox?.currency || "EGP";
  const cashboxBaseCurrency = cashbox?.baseCurrency || "EGP";

  const isForeignCashbox = cashboxCurrency !== cashboxBaseCurrency;

  const fmt = (n) => (n ?? 0).toLocaleString("ar-EG");

  /*
   * Options
   */
  const partyOptions = useMemo(
    () =>
      (parties || []).map((party) => ({
        value: party.id,
        label: party.name,
      })),
    [parties],
  );

  const driverOptions = useMemo(
    () =>
      (drivers || []).map((driver) => ({
        value: driver.id,
        label: driver.name,
      })),
    [drivers],
  );

  /*
   * تغيير Draft Filter
   */
  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        [key]: value,
      },
    }));
  };

  /*
   * تطبيق الفلاتر
   */
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      applied: { ...prev.draft },
    }));

    setPage(1);
  };

  /*
   * Reset
   */
  const handleReset = () => {
    const reset = { ...emptyFilters };

    setFilters({
      draft: reset,
      applied: reset,
    });

    setPage(1);
  };

  /*
   * عدد الفلاتر المفعلة
   */
  const activeFilters = useMemo(() => {
    return Object.values(filters.draft).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length;
  }, [filters.draft]);

  /*
   * لو اختار PartyType مختلف، نمسح الطرف الآخر
   */
  const handlePartyTypeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        PartyType: value,
        BusinessPartnerId:
          value === "Partner" ? prev.draft.BusinessPartnerId : "",
        DriverId: value === "Driver" ? prev.draft.DriverId : "",
        DriverTripId: value === "Driver" ? prev.draft.DriverTripId : "",
      },
    }));
  };

  async function handleAddVoucher(payload) {
    await createVoucher({
      ...payload,
      cashboxId,
    }).unwrap();
  }

  async function handleUpdateVoucher(payload) {
    await updateVoucher({
      ...payload,
      cashboxId,
    }).unwrap();
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const { printList, printRef } = useCashboxLedgerPrint({
    title: `كشف حركة ${cashbox?.name || "الخزنة"}`,
  });

  return (
    <div className="animate-fadeUp space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-ink-500 transition hover:text-primary-600"
      >
        <ArrowRight size={16} />
        العودة للخزائن
      </button>

      {/* Cashbox Header */}
      <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink-900">
                {cashbox?.name || "الخزنة"}
              </h1>

              {cashbox && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    isForeignCashbox
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-primary-200 bg-primary-50 text-primary-600"
                  }`}
                >
                  {currencySymbols[cashboxCurrency] || cashboxCurrency}{" "}
                  {cashboxCurrency}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-ink-400">
              سجل حركة الخزنة اليومية — وارد، صادر، ورصيد تراكمي
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {cashbox && (
              <div className="text-left">
                <p className="text-xs text-ink-400">الرصيد الحالي</p>

                <p className="num text-lg font-bold text-ink-900">
                  {fmt(cashbox.currentBalance)} {cashboxCurrency}
                </p>

                {isForeignCashbox && (
                  <p className="num text-xs text-ink-400">
                    ≈{" "}
                    {fmt(
                      cashbox.currentBalance *
                        (cashbox.openingExchangeRate || 1),
                    )}{" "}
                    {cashboxBaseCurrency}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={printList}>
                <Printer size={16} />
                طباعة
              </Button>

              <Button variant="outline" onClick={refetch}>
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filter Header */}
        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Filter size={18} className="text-primary-600" />
            </div>

            <div className="text-right">
              <h3 className="font-semibold">فلاتر البحث</h3>

              <span className="text-xs text-gray-500">
                {activeFilters} فلتر مفعل
              </span>
            </div>
          </div>

          <motion.div
            animate={{
              rotate: filtersOpen ? 180 : 0,
            }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </button>

        {/* Filter Body */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
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
              }}
            >
              <div className="border-t p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {/* Search */}
                  <Input
                    label="بحث عام"
                    placeholder="رقم السند، البيان، الطرف..."
                    value={filters.draft.Search}
                    onChange={(e) => setFilter("Search", e.target.value)}
                  />

                  {/* Voucher Number */}
                  <Input
                    label="رقم السند"
                    placeholder="رقم السند"
                    value={filters.draft.VoucherNumber}
                    onChange={(e) => setFilter("VoucherNumber", e.target.value)}
                  />

                  {/* Direction */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      نوع الحركة
                    </label>

                    <CompactSelect
                      options={directionOptions}
                      value={filters.draft.Direction}
                      onChange={(value) => setFilter("Direction", value)}
                      placeholder="الكل"
                    />
                  </div>

                  {/* Party Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      نوع الطرف
                    </label>

                    <CompactSelect
                      options={partyTypeOptions}
                      value={filters.draft.PartyType}
                      onChange={handlePartyTypeChange}
                      placeholder="الكل"
                    />
                  </div>

                  {/* Partner */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      الشريك
                    </label>

                    <CompactSelect
                      options={partyOptions}
                      value={filters.draft.BusinessPartnerId}
                      onChange={(value) =>
                        setFilter("BusinessPartnerId", value)
                      }
                      isLoading={isLoadingParties}
                      isDisabled={
                        filters.draft.PartyType !== "" &&
                        filters.draft.PartyType !== "Partner"
                      }
                      placeholder="الكل"
                    />
                  </div>

                  {/* Driver */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      السائق
                    </label>

                    <CompactSelect
                      options={driverOptions}
                      value={filters.draft.DriverId}
                      onChange={(value) => setFilter("DriverId", value)}
                      isLoading={isLoadingDrivers}
                      isDisabled={
                        filters.draft.PartyType !== "" &&
                        filters.draft.PartyType !== "Driver"
                      }
                      placeholder="الكل"
                    />
                  </div>

                  {/* Draft */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      حالة السند
                    </label>

                    <CompactSelect
                      options={draftOptions}
                      value={filters.draft.IsDraft}
                      onChange={(value) => setFilter("IsDraft", value)}
                      placeholder="الكل"
                    />
                  </div>

                  {/* From Date */}
                  <Input
                    type="date"
                    label="من تاريخ"
                    value={filters.draft.FromDate}
                    onChange={(e) => setFilter("FromDate", e.target.value)}
                  />

                  {/* To Date */}
                  <Input
                    type="date"
                    label="إلى تاريخ"
                    value={filters.draft.ToDate}
                    onChange={(e) => setFilter("ToDate", e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    <RotateCcw size={16} />
                    إعادة تعيين
                  </Button>

                  <Button type="submit">
                    <Search size={16} />
                    بحث
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Ledger */}
      <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <CashboxLedgerTable
          cashboxId={cashboxId}
          cashboxCurrency={cashboxCurrency}
          cashboxBaseCurrency={cashboxBaseCurrency}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          refetch={refetch}
          partyOptions={parties || []}
          driverOptions={drivers || []}
          onAddVoucher={handleAddVoucher}
          onUpdateVoucher={handleUpdateVoucher}
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Print */}
      <div className="hidden">
        <div ref={printRef}>
          <CashboxLedgerPrintTemplate
            cashbox={cashbox}
            items={data?.items || []}
            summary={data?.summary}
            fromDate={filters.applied.FromDate}
            toDate={filters.applied.ToDate}
          />
        </div>
      </div>
    </div>
  );
}
