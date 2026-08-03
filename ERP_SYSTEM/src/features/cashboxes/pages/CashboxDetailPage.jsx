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
import { useGetDriversSelectQuery } from "../../drivers/driversApi";

import CashboxLedgerTable from "../components/CashboxLedgerTable";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

import { useCashboxLedgerPrint } from "../../../shared/hooks/useCashboxLedgerPrint";
import CashboxLedgerPrintTemplate from "../../../shared/components/print/CashboxLedgerPrintTemplate";

const currencySymbols = { EGP: "ج.م", USD: "$" };

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId);
  const { data: parties } = useGetPartiesSelectQuery();
  const { data: drivers } = useGetDriversSelectQuery();

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

  const cashboxCurrency = cashbox?.currency || "EGP";
  const cashboxBaseCurrency = cashbox?.baseCurrency || "EGP";
  const isForeignCashbox = cashboxCurrency !== cashboxBaseCurrency;

  const fmt = (n) => (n ?? 0).toLocaleString("ar-EG");

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
        className="inline-flex items-center gap-2 text-sm text-ink-500 transition hover:text-primary-600"
      >
        <ArrowRight size={16} />
        العودة للخزائن
      </button>

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
                  {currencySymbols[cashboxCurrency] || cashboxCurrency}{" "}
                  {cashboxCurrency}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-400">
              سجل حركة الخزنة اليومية — مدين، دائن، ورصيد تراكمي
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
                  <p className="num text-xs text-ink-400">
                    ≈{" "}
                    {fmt(
                      cashbox.currentBalance *
                        (cashbox.openingExchangeRate || 1),
                    )}{" "}
                    {cashboxBaseCurrency}
                  </p>
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
                  className={isFetching ? "animate-spin" : ""}
                />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-ink-900">
          فلترة الحركات
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          cashboxCurrency={cashboxCurrency}
          cashboxBaseCurrency={cashboxBaseCurrency}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          refetch={refetch}
          partyOptions={parties || []}
          driverOptions={drivers || []}
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
