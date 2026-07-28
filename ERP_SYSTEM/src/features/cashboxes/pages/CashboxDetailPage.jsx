// features/cashboxes/pages/CashboxDetailPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, ArrowRight } from "lucide-react";
import { useGetCashboxByIdQuery } from "../cashboxesApi";
import { useGetCashVouchersQuery } from "../cashVouchersApi";
import CashboxLedgerTable from "../components/CashboxLedgerTable";
import CashVoucherFormModal from "../components/CashVoucherFormModal";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

export default function CashboxDetailPage() {
  const { cashboxId } = useParams();
  const navigate = useNavigate();
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      cashboxId,
      fromDate,
      toDate,
      page,
      pageSize: 100,
    });

  return (
    <div className="animate-fadeUp">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-brand mb-4 transition-colors"
      >
        <ArrowRight size={16} />
        كل الخزائن
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            {cashbox?.name || "الخزنة"}
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            سجل الحركة اليومية — مدين، دائن، ورصيد تراكمي
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </Button>
          <Button onClick={() => setShowVoucherForm(true)}>
            <Plus size={16} />
            سند جديد
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Input
            label="من تاريخ"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <CashboxLedgerTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
      />

      <CashVoucherFormModal
        isOpen={showVoucherForm}
        onClose={() => setShowVoucherForm(false)}
        cashboxId={cashboxId}
        onCreated={refetch}
      />
    </div>
  );
}
