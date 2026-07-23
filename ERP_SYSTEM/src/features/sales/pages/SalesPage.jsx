import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, RefreshCw, FileSpreadsheet, Printer } from "lucide-react";
import { useGetInvoicesQuery } from "../salesApi";
import SalesStatsCards from "../components/SalesStatsCards";
import SalesFiltersCard from "../components/SalesFiltersCard";
import SalesInvoicesTable from "../components/SalesInvoicesTable";
import Pagination from "../../../shared/components/ui/Pagination";
import Button from "../../../shared/components/ui/Button";

const emptyFilters = {
  invoiceNumber: "",
  movementType: "sale",
  partyId: "",
  storeId: "",
  driverId: "",
  paymentMethod: "",
  status: "",
  fromDate: "",
  toDate: "",
};

export default function SalesPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const queryParams = {
    ...appliedFilters,
    page,
    pageSize,
    sortBy,
    sortDir,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useGetInvoicesQuery(queryParams);
  const handleSearch = () => {
    setAppliedFilters(draft);
    console.log(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleExport = () => {
    toast.info("جاري تجهيز ملف Excel...");
  };

  return (
    <div className="animate-fadeUp">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          فواتير المبيعات
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/dashboard/sales/new")}>
            <Plus size={16} />
            فاتورة جديدة
          </Button>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileSpreadsheet size={16} />
            تصدير Excel
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} />
            طباعة
          </Button>
        </div>
      </div>

      <SalesStatsCards filters={appliedFilters} />

      <SalesFiltersCard
        draft={draft}
        onChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <SalesInvoicesTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />

      {data?.totalCount > 0 && (
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
      )}
    </div>
  );
}
