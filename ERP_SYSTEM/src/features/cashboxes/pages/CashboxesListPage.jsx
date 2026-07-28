// features/cashboxes/pages/CashboxesListPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useGetCashboxesQuery } from "../cashboxesApi";
import CashboxCard from "../components/CashboxCard";
import CashboxFormModal from "../components/CashboxFormModal";
import Button from "../../../shared/components/ui/Button";

export default function CashboxesListPage() {
  const navigate = useNavigate();
  const [showNewCashbox, setShowNewCashbox] = useState(false);
  const {
    data: cashboxes,
    isLoading,
    isError,
    refetch,
  } = useGetCashboxesQuery();
  console.log(cashboxes);

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الخزائن
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            إدارة الخزائن النقدية والحسابات البنكية
          </p>
        </div>
        <Button onClick={() => setShowNewCashbox(true)}>
          <Plus size={16} />
          خزنة جديدة
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl">
          <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل الخزائن</p>
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && cashboxes?.items?.length === 0 && (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400 mb-3">لا توجد خزائن بعد</p>
          <Button onClick={() => setShowNewCashbox(true)}>
            <Plus size={16} />
            إضافة أول خزنة
          </Button>
        </div>
      )}

      {!isLoading && !isError && cashboxes?.items?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashboxes?.items?.map((cashbox) => (
            <CashboxCard
              key={cashbox.id}
              cashbox={cashbox}
              onClick={() => navigate(`/dashboard/treasury/${cashbox.id}`)}
            />
          ))}
        </div>
      )}

      <CashboxFormModal
        isOpen={showNewCashbox}
        onClose={() => setShowNewCashbox(false)}
        onCreated={(created) => navigate(`/treasury/${created.id}`)}
      />
    </div>
  );
}
