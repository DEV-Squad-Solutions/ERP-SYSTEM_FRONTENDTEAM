import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, RefreshCw, FileSpreadsheet, Printer } from "lucide-react";
import {
  useGetInvoicesForSummaryQuery,
  useGetInvoicesQuery,
} from "../../invoices/invoicesApi";
import SalesStatsCards from "../components/SalesStatsCards";
import SalesFiltersCard from "../components/SalesFiltersCard";
import SalesInvoicesTable from "../components/SalesInvoicesTable";
import Button from "../../../shared/components/ui/Button";
import { computeSalesSummary } from "../utils/salesFiltering";
import { useInvoiceListPrint } from "../../../shared/hooks/useInvoiceListPrint";
import InvoiceListPrintTemplate from "../../../shared/components/print/InvoiceListPrintTemplate";
import { exportInvoicesToExcel } from "../../../shared/hooks/exportInvoicesToExcel";
const emptyFilters = {
  invoiceNumber: "",
  movementType: "",
  partyId: "",
  country: "",
  storeId: "",
  driverId: "",
  paymentMethod: "",
  status: "",
  itemsCategoryId: "",
  currency: "",
  fromDate: "",
  toDate: "",
};

export default function SalesPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [triggerExport, setTriggerExport] = useState(false);
  const { data: exportData, isFetching: isExporting } =
    useGetInvoicesForSummaryQuery(appliedFilters, { skip: !triggerExport });

  useEffect(() => {
    if (triggerExport && exportData) {
      const fileName =
        appliedFilters.movementType === "purchase"
          ? "فواتير-المشتريات"
          : "فواتير-المبيعات";

      exportInvoicesToExcel(exportData.items, fileName);
      setTriggerExport(false);

      if (exportData.items?.length) {
        toast.success(`تم تصدير ${exportData.items.length} فاتورة`);
      } else {
        toast.info("لا توجد فواتير مطابقة للتصدير");
      }
    }
  }, [triggerExport, exportData, appliedFilters.movementType]);

  const handleExport = () => {
    toast.info("جاري تجهيز ملف Excel...");
    setTriggerExport(true);
  };

  const queryParams = {
    ...appliedFilters,
    page,
    pageSize,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useGetInvoicesQuery(queryParams);

  const handleSearch = () => {
    setAppliedFilters(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };
  const { printList, printRef } = useInvoiceListPrint({
    title: `فواتير-${appliedFilters.movementType === "purchase" ? "المشتريات" : "المبيعات"}`,
  });

  const Summary = data?.summary;
  return (
    <div className="animate-fadeUp">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          فواتير المبيعات و المشتريات
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
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <FileSpreadsheet size={16} />
            {isExporting ? "جاري التصدير..." : "تصدير Excel"}
          </Button>
          <Button variant="outline" onClick={printList}>
            <Printer size={16} />
            طباعة
          </Button>
        </div>
      </div>

      <SalesStatsCards summary={Summary} />

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
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoiceListPrintTemplate
            invoices={data?.items || []}
            filters={appliedFilters}
            summary={Summary}
          />
        </div>
      </div>
    </div>
  );
}
