import { useState } from "react";
import {
  ArrowRight,
  Pencil,
  Printer,
  Copy,
  FileDown,
  Boxes,
  History,
  Trash2,
  MoreVertical,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
} from "lucide-react";
import { PaymentStatusBadge } from "./InvoiceStatusBadge";
import { useInvoicePrint } from "../../../../shared/hooks/useInvoicePrint";
import InvoicePrintTemplate from "../../../../shared/components/print/InvoicePrintTemplate";
import { useNavigate } from "react-router-dom";

const typeLabels = {
  Sales: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const contentTypeLabels = {
  Items: "أصناف",
  Containers: "عبوات",
};

/**
 * @param {{ invoice: Object, onAction: (action: string) => void, isFetching?: boolean }} props
 */
export default function InvoiceHeader({ invoice, onAction, isFetching }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isPurchase =
    invoice.invoiceType === "Purchase" ||
    invoice.invoiceType === "PurchaseReturn";
  const { printInvoice, printRef, invoiceToPrint } = useInvoicePrint();

  return (
    <div
      className={`bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 sm:p-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-ink-400 hover:text-ink-900 transition-colors"
            title="رجوع"
          >
            <ArrowRight size={18} />
          </button>

          {isPurchase ? (
            <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
              <ArrowDownCircle size={13} />
              {typeLabels[invoice.invoiceType] || invoice.invoiceType}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
              <ArrowUpCircle size={13} />
              {typeLabels[invoice.invoiceType] || invoice.invoiceType}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 bg-ink-900/[0.04] text-ink-600 text-xs font-medium px-2.5 py-1 rounded-full">
            <Package size={13} />
            {contentTypeLabels[invoice.contentType] || invoice.contentType}
          </span>

          <h2 className="font-display text-lg sm:text-xl font-bold text-ink-900">
            {invoice.invoiceNumber}
          </h2>
          <PaymentStatusBadge status={invoice.paymentStatus} />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAction("edit")}
            className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
            title="تعديل"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => printInvoice(invoice)}
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-400/5 transition-colors"
            title="طباعة"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={() => onAction("packaging")}
            className="p-2 rounded-lg text-gold-600 hover:bg-gold-50 transition-colors"
            title="مخزن العبوات"
          >
            <Boxes size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="p-2 rounded-lg text-ink-400 hover:bg-ink-400/5 transition-colors"
              title="المزيد"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-card border border-ink-400/10 py-1 z-20 animate-fadeUp">
                  <div className="border-t border-ink-400/10 my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAction("delete");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-negative hover:bg-negative/5 text-right"
                  >
                    <Trash2 size={14} />
                    حذف الفاتورة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoicePrintTemplate invoice={invoiceToPrint} />
        </div>
      </div>
    </div>
  );
}
