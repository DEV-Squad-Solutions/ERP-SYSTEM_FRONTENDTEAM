import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  itemName,
  description = "هذا الإجراء لا يمكن التراجع عنه.",
  isDeleting = false,
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title={title}
    >
      <div className="space-y-5">
        {/* Icon / Warning */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>

          <h4 className="mt-4 text-base font-bold text-ink-900">
            هل أنت متأكد من الحذف؟
          </h4>

          {itemName && (
            <p className="mt-2 text-sm text-ink-700">
              سيتم حذف{" "}
              <span className="font-semibold text-ink-900">"{itemName}"</span>
            </p>
          )}

          <p className="mt-2 text-xs leading-6 text-ink-400">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-ink-400/10 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                تأكيد الحذف
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
