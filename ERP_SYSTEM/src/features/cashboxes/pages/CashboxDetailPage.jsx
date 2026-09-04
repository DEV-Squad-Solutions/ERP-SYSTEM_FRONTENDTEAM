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
import { useSelector } from "react-redux";

import { useGetCashboxByIdQuery } from "../cashboxesApi";

import {
  useGetCashVouchersQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
  useDeleteCashVoucherMutation,
} from "../cashVouchersApi";

import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import { useGetEmployeesSelectQuery } from "../../payroll/payrollApi";

import CashboxLedgerTable from "../components/CashboxLedgerTable";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

import { useCashboxLedgerPrint } from "../../../shared/hooks/useCashboxLedgerPrint";

import CashboxLedgerPrintTemplate from "../../../shared/components/print/CashboxLedgerPrintTemplate";

import { selectIsAdmin } from "../../auth/authSlice";

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
  search: "",
  voucherNumber: "",
  direction: "",
  cashboxId: "",
  cashMovementTypeId: "",
  classification: "",
  partyType: "",
  employeeId: "",
  businessPartnerId: "",
  driverId: "",
  driverTripId: "",
  isDraft: "",
  fromDate: "",
  toDate: "",
};

const directionOptions = [
  {
    value: "Receipt",
    label: "وارد",
  },
  {
    value: "Payment",
    label: "صادر",
  },
];

const classificationOptions = [
  {
    value: "PartnerSettlement",
    label: "تسوية طرف",
  },
  {
    value: "Expense",
    label: "مصروف",
  },
  {
    value: "Revenue",
    label: "إيراد",
  },
  {
    value: "Other",
    label: "أخرى",
  },
];

const partyTypeOptions = [
  {
    value: "None",
    label: "بدون طرف",
  },
  {
    value: "Partner",
    label: "شريك",
  },
  {
    value: "Driver",
    label: "سائق",
  },
  {
    value: "Other",
    label: "طرف آخر",
  },
  {
    value: "Employee",
    label: "موظف",
  },
];

const draftOptions = [
  {
    value: "true",
    label: "مسودة",
  },
  {
    value: "false",
    label: "مرحل",
  },
];

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  const [filters, setFilters] = useState({
    draft: {
      ...emptyFilters,
      cashboxId,
    },
    applied: {
      ...emptyFilters,
      cashboxId,
    },
  });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: cashbox, isFetching: isFetchingCashbox } =
    useGetCashboxByIdQuery(cashboxId);

  const { data: parties, isLoading: isLoadingParties } =
    useGetPartiesSelectQuery();

  const { data: drivers, isLoading: isLoadingDrivers } =
    useGetDriversSelectQuery();

  const { data: employees, isLoading: isLoadingEmployees } =
    useGetEmployeesSelectQuery();

  const {
    data: movementTypesForFilter,
    isLoading: isLoadingMovementTypesFilter,
  } = useGetCashMovementTypeOptionsQuery({
    direction: filters.draft.direction || undefined,
    forPartner:
      filters.draft.classification === "PartnerSettlement" ? true : undefined,
  });

  const movementTypeFilterOptions = useMemo(
    () =>
      (movementTypesForFilter || []).map((type) => ({
        value: String(type.id),
        label: type.name,
      })),
    [movementTypesForFilter],
  );

  const [createVoucher] = useCreateCashVoucherMutation();
  const [updateVoucher] = useUpdateCashVoucherMutation();
  const [deleteVoucher] = useDeleteCashVoucherMutation();

  const queryParams = useMemo(
    () => ({
      pageNumber: page,
      pageSize,
      cashboxId,
      search: filters.applied.search || undefined,
      voucherNumber: filters.applied.voucherNumber || undefined,
      direction: filters.applied.direction || undefined,
      cashMovementTypeId: filters.applied.cashMovementTypeId || undefined,
      classification: filters.applied.classification || undefined,
      partyType: filters.applied.partyType || undefined,
      employeeId: filters.applied.employeeId || undefined,
      businessPartnerId: filters.applied.businessPartnerId || undefined,
      driverId: filters.applied.driverId || undefined,
      driverTripId: filters.applied.driverTripId || undefined,
      isDraft:
        filters.applied.isDraft === "true"
          ? "true"
          : filters.applied.isDraft === "false"
            ? "false"
            : undefined,
      fromDate: filters.applied.fromDate || undefined,
      toDate: filters.applied.toDate || undefined,
    }),
    [cashboxId, page, pageSize, filters.applied],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery(queryParams);

  const cashboxCurrency = cashbox?.currency || "EGP";
  const cashboxBaseCurrency = cashbox?.baseCurrency || "EGP";
  const isForeignCashbox = cashboxCurrency !== cashboxBaseCurrency;

  const fmt = (number) =>
    Number(number ?? 0).toLocaleString("ar-EG", {
      maximumFractionDigits: 2,
    });

  const setFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      draft: {
        ...previous.draft,
        [key]: value,
      },
    }));
  };

  const handleSearch = () => {
    setFilters((previous) => ({
      ...previous,
      applied: {
        ...previous.draft,
      },
    }));

    setPage(1);
  };

  const handleReset = () => {
    const reset = {
      ...emptyFilters,
      cashboxId,
    };

    setFilters({
      draft: reset,
      applied: reset,
    });

    setPage(1);
  };

  const activeFilters = useMemo(
    () =>
      Object.entries(filters.draft).filter(
        ([key, value]) =>
          key !== "cashboxId" &&
          value !== "" &&
          value !== null &&
          value !== undefined,
      ).length,
    [filters.draft],
  );

  const handlePartyTypeChange = (value) => {
    setFilters((previous) => ({
      ...previous,
      draft: {
        ...previous.draft,
        partyType: value,
        employeeId: value === "Employee" ? previous.draft.employeeId : "",
        businessPartnerId:
          value === "Partner" ? previous.draft.businessPartnerId : "",
        driverId: value === "Driver" ? previous.draft.driverId : "",
        driverTripId: value === "Driver" ? previous.draft.driverTripId : "",
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

  async function handleDeleteVoucher({ id, rowVersion }) {
    if (!isAdmin) {
      throw new Error("ليس لديك صلاحية حذف السند");
    }

    await deleteVoucher({
      id,
      rowVersion,
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
                  {currencySymbols[cashboxCurrency]} {cashboxCurrency}
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
                  <>
                    <p className="num text-xs text-ink-400">
                      ≈
                      {fmt(
                        cashbox.currentBalance *
                          (cashbox.currentExchangeRate ??
                            cashbox.openingExchangeRate ??
                            1),
                      )}
                      {cashboxBaseCurrency}
                    </p>

                    <p className="mt-1 text-[11px] text-ink-400">
                      سعر الصرف:
                      {fmt(
                        cashbox.currentExchangeRate ??
                          cashbox.openingExchangeRate ??
                          1,
                      )}
                    </p>
                  </>
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
                  className={
                    isFetching || isFetchingCashbox ? "animate-spin" : ""
                  }
                />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setFiltersOpen((previous) => !previous)}
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

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.form
              onSubmit={(event) => {
                event.preventDefault();
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
                  <Input
                    label="بحث عام"
                    placeholder="رقم السند، البيان، الطرف..."
                    value={filters.draft.search}
                    onChange={(event) =>
                      setFilter("search", event.target.value)
                    }
                  />

                  <Input
                    label="رقم السند"
                    placeholder="رقم السند"
                    value={filters.draft.voucherNumber}
                    onChange={(event) =>
                      setFilter("voucherNumber", event.target.value)
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      اتجاه الحركة
                    </label>

                    <CompactSelect
                      options={directionOptions}
                      value={filters.draft.direction}
                      onChange={(value) => setFilter("direction", value)}
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      الخزنة
                    </label>

                    <Input value={cashbox?.name || ""} disabled />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      نوع الحركة
                    </label>

                    <CompactSelect
                      options={movementTypeFilterOptions}
                      value={filters.draft.cashMovementTypeId}
                      onChange={(value) =>
                        setFilter("cashMovementTypeId", value)
                      }
                      isLoading={isLoadingMovementTypesFilter}
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      التصنيف
                    </label>

                    <CompactSelect
                      options={classificationOptions}
                      value={filters.draft.classification}
                      onChange={(value) => setFilter("classification", value)}
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      نوع الطرف
                    </label>

                    <CompactSelect
                      options={partyTypeOptions}
                      value={filters.draft.partyType}
                      onChange={handlePartyTypeChange}
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      الموظف
                    </label>

                    <CompactSelect
                      options={(employees || []).map((employee) => ({
                        value: employee.id,
                        label: employee.name,
                      }))}
                      value={filters.draft.employeeId}
                      onChange={(value) => setFilter("employeeId", value)}
                      isLoading={isLoadingEmployees}
                      isDisabled={
                        filters.draft.partyType !== "" &&
                        filters.draft.partyType !== "Employee"
                      }
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      الشريك
                    </label>

                    <CompactSelect
                      options={(parties || []).map((party) => ({
                        value: party.id,
                        label: party.name,
                      }))}
                      value={filters.draft.businessPartnerId}
                      onChange={(value) =>
                        setFilter("businessPartnerId", value)
                      }
                      isLoading={isLoadingParties}
                      isDisabled={
                        filters.draft.partyType !== "" &&
                        filters.draft.partyType !== "Partner"
                      }
                      placeholder="الكل"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      السائق
                    </label>

                    <CompactSelect
                      options={(drivers || []).map((driver) => ({
                        value: driver.id,
                        label: driver.name,
                      }))}
                      value={filters.draft.driverId}
                      onChange={(value) => setFilter("driverId", value)}
                      isLoading={isLoadingDrivers}
                      isDisabled={
                        filters.draft.partyType !== "" &&
                        filters.draft.partyType !== "Driver"
                      }
                      placeholder="الكل"
                    />
                  </div>

                  <Input
                    label="رقم رحلة السائق"
                    placeholder="Trip ID"
                    value={filters.draft.driverTripId}
                    onChange={(event) =>
                      setFilter("driverTripId", event.target.value)
                    }
                    disabled={
                      filters.draft.partyType !== "" &&
                      filters.draft.partyType !== "Driver"
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      حالة السند
                    </label>

                    <CompactSelect
                      options={draftOptions}
                      value={filters.draft.isDraft}
                      onChange={(value) => setFilter("isDraft", value)}
                      placeholder="الكل"
                    />
                  </div>

                  <Input
                    type="date"
                    label="من تاريخ"
                    value={filters.draft.fromDate}
                    onChange={(event) =>
                      setFilter("fromDate", event.target.value)
                    }
                  />

                  <Input
                    type="date"
                    label="إلى تاريخ"
                    value={filters.draft.toDate}
                    onChange={(event) =>
                      setFilter("toDate", event.target.value)
                    }
                  />
                </div>

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
          employeeOptions={employees || []}
          onAddVoucher={handleAddVoucher}
          onUpdateVoucher={handleUpdateVoucher}
          onDeleteVoucher={isAdmin ? handleDeleteVoucher : undefined}
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      <div className="hidden">
        <div ref={printRef}>
          <CashboxLedgerPrintTemplate
            cashbox={cashbox}
            items={data?.items || []}
            summary={data?.summary}
            fromDate={filters.applied.fromDate}
            toDate={filters.applied.toDate}
          />
        </div>
      </div>
    </div>
  );
}
