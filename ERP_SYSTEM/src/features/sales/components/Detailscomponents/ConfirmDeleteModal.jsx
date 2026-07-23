import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import Modal from "../../../../shared/components/ui/Modal";
import Button from "../../../../shared/components/ui/Button";

/**
 * @param {{ open: boolean, onClose: () => void, invoiceNumber: string, isDeleting: boolean, onConfirm: () => void }} props
 */
export default function ConfirmDeleteModal({
  open,
  onClose,
  invoiceNumber,
  isDeleting,
  onConfirm,
}) {
  return (
    <Modal isOpen={open} onClose={onClose} title="تأكيد الحذف">
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-full bg-negative/10 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle
            size={26}
            className="text-negative"
            strokeWidth={1.6}
          />
        </div>
        <p className="text-ink-900 font-medium mb-1">
          متأكد إنك عايز تحذف الفاتورة{" "}
          <span className="num">{invoiceNumber}</span>؟
        </p>
        <p className="text-sm text-ink-400 mb-5">
          هذا الإجراء لا يمكن التراجع عنه
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            حذف نهائيًا
          </Button>
        </div>
      </div>
    </Modal>
  );
}
