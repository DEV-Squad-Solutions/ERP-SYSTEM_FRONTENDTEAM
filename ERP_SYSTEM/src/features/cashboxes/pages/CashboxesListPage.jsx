import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, ArrowLeftRight } from "lucide-react";
import {
  useGetCashboxesQuery,
  useDeleteCashboxMutation,
} from "../cashboxesApi";
import CashboxCard from "../components/CashboxCard";
import CashboxFormModal from "../components/CashboxFormModal";
import CashboxTransferModal from "../components/CashboxTransferModal";
import Button from "../../../shared/components/ui/Button";

export default function CashboxesListPage() {
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingCashbox, setEditingCashbox] = useState(null);

  const {
    data: cashboxes,
    isLoading,
    isError,
    refetch,
  } = useGetCashboxesQuery();
  const [deleteCashbox] = useDeleteCashboxMutation();

  const openCreate = () => {
    setEditingCashbox(null);
    setShowFormModal(true);
  };

  const openEdit = (cashbox) => {
    setEditingCashbox(cashbox);
    setShowFormModal(true);
  };

  const handleDelete = (cashbox) => {
    toast(`حذف "${cashbox.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteCashbox(cashbox.id).unwrap();
            toast.success("تم حذف الخزنة بنجاح");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

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

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTransferModal(true)}>
            <ArrowLeftRight size={16} />
            تحويل بين الخزائن
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} />
            خزنة جديدة
          </Button>
        </div>
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
          <Button onClick={openCreate}>
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
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CashboxFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        cashbox={editingCashbox}
        onSaved={(saved) => {
          if (!editingCashbox) navigate(`/dashboard/treasury/${saved.id}`);
        }}
      />

      <CashboxTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        cashboxes={cashboxes?.items ?? []}
        onDone={refetch}
      />
    </div>
  );
}
