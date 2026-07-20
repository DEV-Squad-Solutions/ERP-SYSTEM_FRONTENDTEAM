import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useGetPurchasesLinesQuery } from "../purchaseApi";
import Modal from "../../../shared/components/ui/Modal";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";

/**
 * @param {{ invoiceId: string|null, isOpen: boolean, onClose: () => void }} props
 */
export default function InvoiceDetailsModal({ invoiceId, isOpen, onClose }) {
  const {
    data: invoice,
    isLoading,
    isError,
  } = useGetPurchasesLinesQuery(invoiceId, {
    skip: !isOpen || !invoiceId,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        invoice ? `تفاصيل الفاتورة ${invoice.invoiceNumber}` : "تفاصيل الفاتورة"
      }
      wide
    >
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-negative text-sm py-4">
          تعذر تحميل تفاصيل الفاتورة
        </p>
      )}

      {invoice && (
        <div className="space-y-4">
          {/* بيانات رأس الفاتورة */}
          <div className="flex items-center justify-between">
            {invoice.movementType === "purchase" ? (
              <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
                <ArrowDownCircle size={13} />
                مشتريات
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
                <ArrowUpCircle size={13} />
                مبيعات
              </span>
            )}
            <span className="text-sm text-ink-400 num">{invoice.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>عميل / مورد</span>
              <span className="text-ink-900 font-medium">
                {invoice.partyName}
              </span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>البلد</span>
              <span className="text-ink-900">{invoice.country}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>السائق</span>
              <span className="text-ink-900">{invoice.driverName}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>رقم السيارة</span>
              <span className="text-ink-900 num">{invoice.carNumber}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
