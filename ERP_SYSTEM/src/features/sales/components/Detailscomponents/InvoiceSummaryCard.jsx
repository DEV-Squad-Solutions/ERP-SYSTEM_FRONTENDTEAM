import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";
import { PaymentStatusBadge } from "./InvoiceStatusBadge";

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceSummaryCard({ invoice }) {
  const symbol = invoice.currency === "USD" ? "$" : "ج.م";

  const rows = [
    {
      label: "عدد الأصناف",
      value: invoice.lines?.length || 0,
      tone: "text-ink-900",
      isCount: true,
    },
    { label: "الإجمالي الفرعي", value: invoice.subtotal, tone: "text-ink-900" },
    { label: "الخصم", value: invoice.discountAmount, tone: "text-negative" },
    { label: "الصافي", value: invoice.total, tone: "text-primary-500" },
    { label: "المدفوع", value: invoice.paidAmount, tone: "text-positive" },
    {
      label: "المتبقي",
      value: invoice.remainingAmount,
      tone: invoice.remainingAmount > 0 ? "text-negative" : "text-positive",
    },
  ];

  return (
    <LedgerPanel title="ملخص الفاتورة">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm text-ink-600">حالة السداد</span>
        <PaymentStatusBadge status={invoice.paymentStatus} />
      </div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-stretch">
          <div className="w-28 shrink-0 bg-ink-900/[0.03] px-3 py-2 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            {row.label}
          </div>
          <div
            className={`flex-1 px-3 py-2 text-sm num font-medium flex items-center ${row.tone}`}
          >
            {(row.value || 0).toLocaleString("ar-EG")}
            {!row.isCount && ` ${symbol}`}
          </div>
        </div>
      ))}
    </LedgerPanel>
  );
}
