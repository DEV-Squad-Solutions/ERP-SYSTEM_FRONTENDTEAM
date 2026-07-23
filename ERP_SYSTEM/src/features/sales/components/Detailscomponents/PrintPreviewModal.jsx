import { FileText, Copy, FileDown } from "lucide-react";
import Modal from "../../../../shared/components/ui/Modal";
import Button from "../../../../shared/components/ui/Button";

/**
 * @param {{ open: boolean, onClose: () => void, invoiceId: string, onConfirm: (mode: string) => void }} props
 */
export default function PrintPreviewModal({ open, onClose, onConfirm }) {
  const options = [
    { mode: "original", label: "طباعة أصل الفاتورة", icon: FileText },
    { mode: "copy", label: "طباعة نسخة", icon: Copy },
    { mode: "pdf", label: "تصدير PDF", icon: FileDown },
  ];

  return (
    <Modal isOpen={open} onClose={onClose} title="خيارات الطباعة">
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => {
              onConfirm(opt.mode);
              onClose();
            }}
            className="w-full flex items-center gap-3 rounded-xl border border-ink-400/10 px-4 py-3 hover:border-primary-400 hover:bg-primary-50/50 transition-colors text-right"
          >
            <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
              <opt.icon size={16} />
            </span>
            <span className="text-sm font-medium text-ink-900">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
      <Button variant="outline" onClick={onClose} className="w-full mt-4">
        إلغاء
      </Button>
    </Modal>
  );
}
