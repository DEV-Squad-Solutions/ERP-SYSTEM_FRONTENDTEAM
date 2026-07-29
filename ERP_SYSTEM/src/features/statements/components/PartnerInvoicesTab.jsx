import { useState } from "react";
import { useGetInvoicesQuery } from "../../invoices/invoicesApi";
import SalesInvoicesTable from "../../sales/components/SalesInvoicesTable";
import Pagination from "../../../shared/components/ui/Pagination";
import { useInvoiceListPrint } from "../../../shared/hooks/useInvoiceListPrint";
import Button from "../../../shared/components/ui/Button";
import { Printer } from "lucide-react";
import InvoiceListPrintTemplate from "../../../shared/components/print/InvoiceListPrintTemplate";
import SalesStatsCards from "../../sales/components/SalesStatsCards";

/**
 * @param {{ partnerId: string, filters?: Object }} props
 */
export default function PartnerInvoicesTab({ partnerId, filters }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [sortDir, setSortDir] = useState("desc");

  const { data, isLoading, isFetching, isError, refetch } = useGetInvoicesQuery(
    {
      partyId: partnerId,
      page,
      pageSize,
      sortBy,
      sortDir,
      ...filters,
    },
  );

  const summary = data?.summary;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const { printList, printRef } = useInvoiceListPrint({
    title: "تقرير الفواتير",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">فواتير العميل</h2>

          <p className="mt-1 text-sm text-gray-500">
            إجمالي الفواتير: {data?.totalCount ?? data?.items?.length ?? 0}
          </p>
        </div>

        <Button variant="outline" onClick={printList}>
          <Printer size={16} />
          طباعة التقرير
        </Button>
      </div>

      {/* Summary */}
      {summary && <SalesStatsCards summary={summary} />}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <SalesInvoicesTable
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          refetch={refetch}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Print Template */}
      <div className="hidden">
        <div ref={printRef}>
          <InvoiceListPrintTemplate
            invoices={data?.items || []}
            filters={filters}
            summary={summary}
          />
        </div>
      </div>
    </div>
  );
}
