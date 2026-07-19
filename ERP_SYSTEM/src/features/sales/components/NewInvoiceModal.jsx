import Modal from "../../../shared/components/ui/Modal";
import NewInvoiceForm from "./NewInvoiceForm";

/**
 * @param {{ invoiceId?: string|null, isOpen: boolean, onClose: () => void }} props
 */
export default function NewInvoiceModal({ invoiceId, isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceId ? "تعديل الفاتورة" : "فاتورة جديدة"}
      wide
    >
      <NewInvoiceForm invoiceId={invoiceId} onSuccess={onClose} />
    </Modal>
  );
}
