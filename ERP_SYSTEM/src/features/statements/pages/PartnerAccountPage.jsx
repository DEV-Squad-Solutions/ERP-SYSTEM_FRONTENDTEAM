import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Receipt, StoreIcon } from "lucide-react";

import { useGetPartnerStatementQuery } from "../statementsApi";
import { useGetInvoicesQuery } from "../../invoices/invoicesApi";
import { useGetPartyByIdQuery } from "../../partners/partiesApi";

import PartnerSelectHeader from "../components/PartnerSelectHeader";
import StatementFilters from "../components/StatementFilters";
import StatementTable from "../components/StatementTable";
import PartnerInvoicesTab from "../components/PartnerInvoicesTab";
import PartnerItemsTab from "../components/PartnerItemsTab";
import SalesFiltersCard from "../../sales/components/SalesFiltersCard";

import { usePersistentTab } from "../../../shared/hooks/usePersistentTab";

const TABS = ["statement", "invoices", "items"];

const emptyStatementFilters = {
  Search: "",
  FromDate: "",
  ToDate: "",
  SourceType: "",
  MovementType: "",
  CashMovementTypeId: "",
};

const emptyInvoiceFilters = {
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

export default function PartnerAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const partnerId = searchParams.get("partnerId") || "";

  const [activeTab, setActiveTab] = usePersistentTab("statement", TABS);

  const [filters, setFilters] = useState({
    statement: {
      draft: emptyStatementFilters,
      applied: emptyStatementFilters,
    },
    invoices: {
      draft: emptyInvoiceFilters,
      applied: emptyInvoiceFilters,
    },
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerStatementQuery(
      {
        BusinessPartnerId: partnerId,
        PageNumber: page,
        PageSize: pageSize,
        ...filters.statement.applied,
      },
      {
        skip: !partnerId,
      },
    );

  const { data: partner } = useGetPartyByIdQuery(partnerId, {
    skip: !partnerId,
  });

  useGetInvoicesQuery(
    {
      businessPartnerId: partnerId,
      pageSize: 100,
    },
    {
      skip: !partnerId,
    },
  );

  const handlePartnerChange = (id) => {
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
        draft: emptyStatementFilters,
        applied: emptyStatementFilters,
      },
      invoices: {
        draft: emptyInvoiceFilters,
        applied: emptyInvoiceFilters,
      },
    });
  };

  const handleFilterChange = (tab, value) => {
    setFilters((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        draft: value,
      },
    }));
  };

  const handleSearch = (tab) => {
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
  };

  const handleReset = (tab) => {
    const empty =
      tab === "statement" ? emptyStatementFilters : emptyInvoiceFilters;

    setFilters((prev) => ({
      ...prev,
      [tab]: {
        draft: empty,
        applied: empty,
      },
    }));

    if (tab === "statement") {
      setPage(1);
    }
  };

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          العملاء والموردين
        </h2>

        <p className="mt-1 text-sm text-ink-400">
          كشف حساب متكامل مع سجل الفواتير الخاصة بكل عميل أو مورد
        </p>
      </div>

      <PartnerSelectHeader
        partnerId={partnerId}
        onChange={handlePartnerChange}
      />

      {!partnerId ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-20 text-center">
          <p className="text-ink-400">
            اختر عميل أو مورد من الأعلى لعرض بياناته
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 inline-flex rounded-xl bg-ink-400/5 p-1">
            <button
              onClick={() => setActiveTab("statement")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${
                activeTab === "statement"
                  ? "bg-white font-medium text-primary-500 shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              <Receipt size={14} />
              كشف الحساب
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${
                activeTab === "invoices"
                  ? "bg-white font-medium text-primary-500 shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              <FileText size={14} />
              الفواتير
            </button>

            <button
              onClick={() => setActiveTab("items")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${
                activeTab === "items"
                  ? "bg-white font-medium text-primary-500 shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              <StoreIcon size={14} />
              الأصناف
            </button>
          </div>

          {activeTab === "statement" && (
            <>
              <StatementFilters
                draft={filters.statement.draft}
                onChange={(value) => handleFilterChange("statement", value)}
                onSearch={() => handleSearch("statement")}
                onReset={() => handleReset("statement")}
              />

              <StatementTable
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                refetch={refetch}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )}

          {activeTab === "invoices" && (
            <>
              <SalesFiltersCard
                draft={filters.invoices.draft}
                onChange={(value) => handleFilterChange("invoices", value)}
                onSearch={() => handleSearch("invoices")}
                onReset={() => handleReset("invoices")}
              />

              <PartnerInvoicesTab
                partner={partner}
                partnerId={partnerId}
                filters={filters.invoices.applied}
              />
            </>
          )}

          {activeTab === "items" && <PartnerItemsTab partnerId={partnerId} />}
        </>
      )}
    </div>
  );
}
