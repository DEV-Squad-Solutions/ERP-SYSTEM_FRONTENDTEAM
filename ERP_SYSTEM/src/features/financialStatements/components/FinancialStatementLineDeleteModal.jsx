import Modal from "../../../shared/components/ui/Modal";
import { Trash2 } from "lucide-react";

export default function FinancialStatementLineDeleteModal({
  isOpen,
  onClose,
  line,
  isLoading = false,
  onConfirm,
}) {
  if (!line) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="حذف بند القائمة المالية">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>

          <div>
            <h4 className="font-bold text-ink-900">
              هل أنت متأكد من حذف هذا البند؟
            </h4>

            <p className="text-sm text-ink-500 mt-1">
              سيتم حذف البند من تشكيل القائمة المالية.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-ink-400/10 bg-ink-400/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink-500">الكود</span>

            <span className="text-sm font-semibold text-ink-900">
              {line.code || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mt-3">
            <span className="text-sm text-ink-500">اسم البند</span>

            <span className="text-sm font-semibold text-ink-900">
              {line.name || "-"}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 text-amber-700 px-4 py-3 text-sm">
          إذا كان البند مرتبطًا بحسابات، أو كانت السنة المالية مغلقة، فسيتم رفض
          الحذف من الـ Backend.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-400/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl border border-ink-400/20 text-ink-700 hover:bg-ink-400/5 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isLoading ? "جاري الحذف..." : "حذف البند"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
