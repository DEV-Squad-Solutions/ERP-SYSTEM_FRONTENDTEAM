// features/sales/components/Detailscomponents/InvoicePaymentCard.jsx
import { Wallet } from "lucide-react";

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoicePaymentCard({ invoice }) {
  if (!invoice.cashboxId && !invoice.paidAmount) return null;

  const rows = [
    { label: "الخزنة", value: invoice.cashboxName },
    { label: "نوع الحركة", value: invoice.cashMovementTypeName },
    {
      label: "المبلغ بعملة الخزنة",
      value: `${Number(invoice.cashboxAmount || 0).toLocaleString("ar-EG")} ${invoice.cashboxCurrency || ""}`,
    },
    ...(invoice.cashboxCurrency &&
    invoice.cashboxCurrency !== invoice.baseCurrency
      ? [
          {
            label: "سعر صرف الخزنة",
            value: invoice.cashboxExchangeRate,
            num: true,
          },
        ]
      : []),
    ...(invoice.realizedExchangeDifference
      ? [
          {
            label: "فرق العملة المحقق",
            value: `${Number(invoice.realizedExchangeDifference).toLocaleString("ar-EG")} ${invoice.baseCurrency || ""}`,
            tone:
              invoice.realizedExchangeDifference >= 0
                ? "text-positive"
                : "text-negative",
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-5">
      <h3 className="font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
        <Wallet size={16} />
        بيانات الدفع
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-ink-600">
            <span>{row.label}</span>
            <span
              className={`font-medium ${row.num ? "num" : ""} ${row.tone || "text-ink-900"}`}
            >
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
