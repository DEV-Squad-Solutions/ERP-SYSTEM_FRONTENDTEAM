import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Receipt, StoreIcon } from "lucide-react";

import { useGetPartnerStatementQuery } from "../statementsApi";
import { useGetPartyByIdQuery } from "../../partners/partiesApi";

import PartnerSelectHeader from "../components/PartnerSelectHeader";
import StatementFilters from "../components/StatementFilters";
import StatementTable from "../components/StatementTable";
import PartnerInvoicesTab from "../components/PartnerInvoicesTab";
import PartnerItemsTab from "../components/PartnerItemsTab";
import SalesFiltersCard from "../../sales/components/SalesFiltersCard";

import { usePersistentTab } from "../../../shared/hooks/usePersistentTab";

// =========================================================
// Constants
// =========================================================

const TABS = ["statement", "invoices", "items"];

const EMPTY_STATEMENT_FILTERS = {
  Search: "",
  FromDate: "",
  ToDate: "",
  SourceType: "",
  MovementType: "",
  CashMovementTypeId: "",
};

const EMPTY_INVOICE_FILTERS = {
  invoiceNumber: "",
  movementType: "",
  fromDate: "",
  toDate: "",
  paymentMethod: "",
  status: "",
  itemsCategoryId: "",
  currency: "",
  storeId: "",
  driverId: "",
  country: "",
};

// =========================================================
// Component
// =========================================================

export default function PartnerAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const partnerId = searchParams.get("partnerId") || "";

  const [activeTab, setActiveTab] = usePersistentTab("statement", TABS);

  // -------------------------------------------------------
  // Filters
  // -------------------------------------------------------

  const initialFilters = useMemo(
    () => ({
      statement: {
        draft: { ...EMPTY_STATEMENT_FILTERS },
        applied: { ...EMPTY_STATEMENT_FILTERS },
      },
      invoices: {
        draft: { ...EMPTY_INVOICE_FILTERS },
        applied: { ...EMPTY_INVOICE_FILTERS },
      },
    }),
    [],
  );

  const [filters, setFilters] = useState(initialFilters);

  // -------------------------------------------------------
  // Pagination
  // -------------------------------------------------------

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // -------------------------------------------------------
  // Statement Query
  // -------------------------------------------------------

  const statementParams = useMemo(
    () => ({
      BusinessPartnerId: partnerId,
      PageNumber: page,
      PageSize: pageSize,
      ...filters.statement.applied,
    }),
    [partnerId, page, pageSize, filters.statement.applied],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerStatementQuery(statementParams, {
      skip: !partnerId,
    });

  // -------------------------------------------------------
  // Partner
  // -------------------------------------------------------

  const { data: partner } = useGetPartyByIdQuery(partnerId, {
    skip: !partnerId,
  });

  // =======================================================
  // Handlers
  // =======================================================

  const handlePartnerChange = useCallback(
    (id) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (id) {
          next.set("partnerId", id);
        } else {
          next.delete("partnerId");
        }

        next.set("tab", "statement");

        return next;
      });

      setPage(1);

      setFilters({
        statement: {
          draft: { ...EMPTY_STATEMENT_FILTERS },
          applied: { ...EMPTY_STATEMENT_FILTERS },
        },
        invoices: {
          draft: { ...EMPTY_INVOICE_FILTERS },
          applied: { ...EMPTY_INVOICE_FILTERS },
        },
      });
    },
    [setSearchParams],
  );

  const handleFilterChange = useCallback((tab, value) => {
    setFilters((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        draft: value,
      },
    }));
  }, []);

  const handleSearch = useCallback((tab) => {
    setFilters((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        applied: prev[tab].draft,
      },
    }));

    if (tab === "statement") {
      setPage(1);
    }
  }, []);

  const handleReset = useCallback((tab) => {
    const empty =
      tab === "statement" ? EMPTY_STATEMENT_FILTERS : EMPTY_INVOICE_FILTERS;

    setFilters((prev) => ({
      ...prev,
      [tab]: {
        draft: { ...empty },
        applied: { ...empty },
      },
    }));

    if (tab === "statement") {
      setPage(1);
    }
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // =======================================================
  // Tabs
  // =======================================================

  const tabs = useMemo(
    () => [
      {
        id: "statement",
        label: "كشف الحساب",
        icon: Receipt,
      },
      {
        id: "invoices",
        label: "الفواتير",
        icon: FileText,
      },
      {
        id: "items",
        label: "الأصناف",
        icon: StoreIcon,
      },
    ],
    [],
  );

  // =======================================================
  // Render
  // =======================================================

  return (
    <div className="min-w-0 animate-fadeUp">
      {/* ===================================================
          Page Header
      =================================================== */}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between   ">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
            العملاء والموردين
          </h2>

          <p className="mt-0.5 text-xs text-ink-400 sm:text-sm">
            كشف حساب متكامل مع سجل الفواتير والأصناف
          </p>
        </div>

        {/* Partner selector */}
        <div className=" flex-1  ">
          <PartnerSelectHeader
            partnerId={partnerId}
            onChange={handlePartnerChange}
          />
        </div>
      </div>

      {/* ===================================================
          Empty State
      =================================================== */}

      {!partnerId ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-ink-400/20 bg-white/40 px-6 text-center">
          <div>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10">
              <Receipt size={20} className="text-primary-500" />
            </div>

            <p className="text-sm font-medium text-ink-700">
              اختر عميل أو مورد
            </p>

            <p className="mt-1 text-xs text-ink-400">
              لعرض كشف الحساب والفواتير والأصناف
            </p>
          </div>
        </div>
      ) : (
        <div className="min-w-0">
          {/* =================================================
              Tabs
          ================================================= */}

          <div className="mb-3 flex w-full overflow-x-auto rounded-xl bg-ink-400/5 p-1 sm:w-fit">
            <div className="flex min-w-max gap-0.5">
              {tabs.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={[
                      "inline-flex h-8 items-center gap-1.5",
                      "rounded-lg px-3 text-xs sm:px-4 sm:text-sm",
                      "transition-all duration-200",
                      "whitespace-nowrap",
                      active
                        ? "bg-white font-medium text-primary-500 shadow-sm"
                        : "text-ink-400 hover:bg-white/60 hover:text-ink-900",
                    ].join(" ")}
                  >
                    <Icon size={14} />

                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              Statement
          ================================================= */}

          {activeTab === "statement" && (
            <div className="min-w-0 space-y-3">
              <StatementFilters
                draft={filters.statement.draft}
                onChange={(value) => handleFilterChange("statement", value)}
                onSearch={() => handleSearch("statement")}
                onReset={() => handleReset("statement")}
              />

              <div className="min-w-0 overflow-hidden rounded-2xl">
                <StatementTable
                  data={data}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  isError={isError}
                  refetch={refetch}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          )}

          {/* =================================================
              Invoices
          ================================================= */}

          {activeTab === "invoices" && (
            <div className="min-w-0 space-y-3">
              <SalesFiltersCard
                draft={filters.invoices.draft}
                onChange={(value) => handleFilterChange("invoices", value)}
                onSearch={() => handleSearch("invoices")}
                onReset={() => handleReset("invoices")}
              />

              <div className="min-w-0 overflow-hidden rounded-2xl">
                <PartnerInvoicesTab
                  partner={partner}
                  partnerId={partnerId}
                  filters={filters.invoices.applied}
                />
              </div>
            </div>
          )}

          {/* =================================================
              Items
          ================================================= */}

          {activeTab === "items" && (
            <div className="min-w-0 overflow-hidden rounded-2xl">
              <PartnerItemsTab partnerId={partnerId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
