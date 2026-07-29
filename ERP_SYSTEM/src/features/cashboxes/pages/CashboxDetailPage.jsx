// features/cashboxes/pages/CashboxDetailPage.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, ArrowRight, Printer } from "lucide-react";

import { useGetCashboxByIdQuery } from "../cashboxesApi";

import {
  useGetCashVouchersQuery,
  useCreateCashVoucherMutation,
} from "../cashVouchersApi";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

import CashboxLedgerTable from "../components/CashboxLedgerTable";
import CashVoucherFormModal from "../components/CashVoucherFormModal";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import { useCashboxLedgerPrint } from "../../../shared/hooks/useCashboxLedgerPrint";
import CashboxLedgerPrintTemplate from "../../../shared/components/print/CashboxLedgerPrintTemplate";

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();

  const [showVoucherForm, setShowVoucherForm] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId);

  const { data: parties } = useGetPartiesSelectQuery();

  const [createVoucher] = useCreateCashVoucherMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      cashboxId,
      fromDate,
      toDate,
      pageNumber: page,
      pageSize,
    });

  async function handleAddVoucher(payload) {
    await createVoucher({
      cashboxId,
      ...payload,
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
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-ink-500
          hover:text-primary-600
          transition
        "
      >
        <ArrowRight size={16} />
        العودة للخزائن
      </button>

      {/* Header */}
      <div
        className="
          rounded-2xl
          border
          border-ink-400/10
          bg-white
          p-5
          shadow-card
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-ink-900
              "
            >
              {cashbox?.name || "الخزنة"}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-ink-400
              "
            >
              سجل حركة الخزنة اليومية — مدين، دائن، ورصيد تراكمي
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
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

            <Button onClick={() => setShowVoucherForm(true)}>
              <Plus size={16} />
              سند جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div
        className="
          rounded-2xl
          border
          border-ink-400/10
          bg-white
          p-5
          shadow-card
        "
      >
        <h3
          className="
            mb-4
            text-sm
            font-semibold
            text-ink-900
          "
        >
          فلترة الحركات
        </h3>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >
          <Input
            label="من تاريخ"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="إلى تاريخ"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Ledger */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-ink-400/10
          bg-white
          shadow-card
        "
      >
        <CashboxLedgerTable
          data={data}

          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}

          refetch={refetch}

          partyOptions={parties || []}

          onAddVoucher={handleAddVoucher}

          page={page}
          pageSize={pageSize}

          totalCount={data?.totalCount}

          onPageChange={handlePageChange}

          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Print Template */}

      <div className="hidden">
        <div ref={printRef}>
          <CashboxLedgerPrintTemplate
            cashbox={cashbox}

            items={data?.items || []}

            summary={data?.summary}

            fromDate={fromDate}

            toDate={toDate}
          />
        </div>
      </div>

      {/* Voucher Modal */}

      <CashVoucherFormModal
        isOpen={showVoucherForm}

        onClose={() => setShowVoucherForm(false)}

        cashboxId={cashboxId}

        onCreated={refetch}
      />
    </div>
  );
}
