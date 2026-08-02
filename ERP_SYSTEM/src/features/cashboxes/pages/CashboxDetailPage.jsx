// features/cashboxes/pages/CashboxDetailPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RefreshCw, ArrowRight, Printer } from "lucide-react";

import { useGetCashboxByIdQuery } from "../cashboxesApi";
import {
  useGetCashVouchersQuery,
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
} from "../cashVouchersApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

import CashboxLedgerTable from "../components/CashboxLedgerTable";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import { useCashboxLedgerPrint } from "../../../shared/hooks/useCashboxLedgerPrint";
import CashboxLedgerPrintTemplate from "../../../shared/components/print/CashboxLedgerPrintTemplate";

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId);
  const { data: parties } = useGetPartiesSelectQuery();
  // TODO: driversApi لسه مش موجود عندنا - لما تبعتلي الـ endpoint هربطه هنا
  const driverOptions = [];

  const [createVoucher] = useCreateCashVoucherMutation();
  const [updateVoucher] = useUpdateCashVoucherMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      cashboxId,
      fromDate,
      toDate,
      pageNumber: page,
      pageSize,
    });

  // cashboxId لازم يتبعت آخر حاجة في الـ spread عشان يفضل هو الأساس
  // حتى لو الـ payload الجاي من الجدول فيه cashboxId بقيمة undefined
  async function handleAddVoucher(payload) {
    await createVoucher({ ...payload, cashboxId }).unwrap();
  }

  async function handleUpdateVoucher(payload) {
    await updateVoucher({ ...payload, cashboxId }).unwrap();
  }

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const { printList, printRef } = useCashboxLedgerPrint({
    title: `كشف حركة ${cashbox?.name || "الخزنة"}`,
  });

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-primary-600 transition"
      >
        <ArrowRight size={16} />
        العودة للخزائن
      </button>

      <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">
              {cashbox?.name || "الخزنة"}
            </h1>
            <p className="mt-2 text-sm text-ink-400">
              سجل حركة الخزنة اليومية — مدين، دائن، ورصيد تراكمي
            </p>
          </div>

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

      <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-ink-900">
          فلترة الحركات
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <CashboxLedgerTable
          cashboxId={cashboxId}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          refetch={refetch}
          partyOptions={parties || []}
          driverOptions={driverOptions}
          onAddVoucher={handleAddVoucher}
          onUpdateVoucher={handleUpdateVoucher}
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount}
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
            fromDate={fromDate}
            toDate={toDate}
          />
        </div>
      </div>
    </div>
  );
}
