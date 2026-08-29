// features/invoiceItemPricing/pages/InvoiceItemPricingPage.jsx
import { useCallback, useState } from "react";

import { useGetInvoiceItemPricingQuery } from "../invoiceItemPricingApi";
import InvoiceItemPricingFilters from "../components/InvoiceItemPricingFilters";
import InvoiceItemPricingTable from "../components/InvoiceItemPricingTable";
import InvoiceLineExpensesModal from "../components/InvoiceLineExpensesModal";

const EMPTY_FILTERS = {
  search: "",
  invoiceType: "",
  fromDate: "",
  toDate: "",
};

export default function InvoiceItemPricingPage() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetInvoiceItemPricingQuery({
      PageNumber: page,
      PageSize: pageSize,
      Search: applied.search || undefined,
      InvoiceType: applied.invoiceType || undefined,
      FromDate: applied.fromDate || undefined,
      ToDate: applied.toDate || undefined,
    });

  const handleSearch = useCallback(() => {
    setApplied(draft);
    setPage(1);
  }, [draft]);

  const handleReset = useCallback(() => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const openExpenses = (line) => {
    setSelectedLine(line);
    setShowExpensesModal(true);
  };

  const closeExpenses = () => {
    setShowExpensesModal(false);
    setSelectedLine(null);
  };

  const handleExpensesSaved = async () => {
    closeExpenses();
    await refetch();
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          تكلفة أصناف الفواتير
        </h2>

        <p className="text-sm text-ink-400 mt-1">
          عرض وإدارة المصروفات المحمّلة على متوسط تكلفة الصنف في كل فاتورة
        </p>
      </div>

      <InvoiceItemPricingFilters
        draft={draft}
        onChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <InvoiceItemPricingTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onManageExpenses={openExpenses}
      />

      <InvoiceLineExpensesModal
        isOpen={showExpensesModal}
        onClose={closeExpenses}
        line={selectedLine}
        onSaved={handleExpensesSaved}
      />
    </div>
  );
}
