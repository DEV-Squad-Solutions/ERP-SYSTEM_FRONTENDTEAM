import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useGetItemUnitsQuery,
  useDeleteItemUnitMutation,
} from "../itemUnitsApi";
import UnitFormModal from "../components/UnitFormModal";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

export default function UnitsPage() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(null);

  const {
    data: units = [],
    isLoading,
    isError,
    refetch,
  } = useGetItemUnitsQuery();
  const [deleteUnit, { isLoading: isDeleting }] = useDeleteItemUnitMutation();

  const openCreate = () => {
    setEditingUnit(null);
    setShowFormModal(true);
  };

  const openEdit = (unit) => {
    setEditingUnit(unit);
    setShowFormModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingUnit) return;
    try {
      await deleteUnit(deletingUnit.id).unwrap();
      toast.success("تم حذف الوحدة بنجاح");
      setDeletingUnit(null);
    } catch (err) {
      toast.error("حصل خطأ أثناء الحذف، حاول تاني");
    }
  };

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            وحدات القياس
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            إدارة وحدات القياس المستخدمة في الأصناف
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus size={16} />
          وحدة جديدة
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl">
          <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل الوحدات</p>
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && units.length === 0 && (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400 mb-3">لا توجد وحدات مضافة بعد</p>
          <Button onClick={openCreate}>
            <Plus size={16} />
            إضافة أول وحدة
          </Button>
        </div>
      )}

      {!isLoading && !isError && units.length > 0 && (
        <div className="bg-white border border-ink-400/10 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-ink-400/10 text-xs text-ink-400 bg-ink-400/5">
                <th className="py-3 px-4 font-medium">الاسم</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr
                  key={unit.id}
                  className="border-b border-ink-400/5 last:border-0"
                >
                  <td className="py-3 px-4 text-sm text-ink-900">
                    {unit.name}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        unit.isActive
                          ? "bg-emerald-700/10 text-emerald-700"
                          : "bg-ink-400/10 text-ink-400"
                      }`}
                    >
                      {unit.isActive ? "نشطة" : "غير نشطة"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(unit)}
                        className="text-ink-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-ink-400/5 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingUnit(unit)}
                        className="text-ink-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-ink-400/5 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UnitFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        unit={editingUnit}
      />

      <Modal
        isOpen={Boolean(deletingUnit)}
        onClose={() => setDeletingUnit(null)}
        title="تأكيد الحذف"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-900">
            هل أنت متأكد من حذف وحدة{" "}
            <span className="font-bold">"{deletingUnit?.name}"</span>؟
          </p>
          <p className="text-xs text-ink-400">الإجراء ده لا يمكن التراجع عنه</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUnit(null)}
            >
              إلغاء
            </Button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
