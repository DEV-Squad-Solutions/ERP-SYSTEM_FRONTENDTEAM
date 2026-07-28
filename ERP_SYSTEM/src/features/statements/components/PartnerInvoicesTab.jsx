import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetInvoicesQuery } from "../../invoices/invoicesApi";
import SalesInvoicesTable from "../../sales/components/SalesInvoicesTable";
import Pagination from "../../../shared/components/ui/Pagination";

/**
 * @param {{ partnerId: string }} props
 */
export default function PartnerInvoicesTab({ partnerId }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [sortDir, setSortDir] = useState("desc");
  const navigate = useNavigate();

  const { data, isLoading, isFetching, isError, refetch } = useGetInvoicesQuery(
    {
      partyId: partnerId,
      page,
      pageSize,
      sortBy,
      sortDir,
    },
  );

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <div>
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
  );
}
