import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceSummaryCard({ invoice }) {
  const items = invoice.items || [];
  const total = items.reduce((s, it) => s + (it.value || 0), 0);
  const discount = invoice.discount || 0;
  const tax = invoice.tax || 0;
  const paid = invoice.paid || 0;
  const net = total - discount + tax;
  const remaining = net - paid;
  const symbol = invoice.currency === "USD" ? "$" : "ج.م";

  const rows = [
    {
      label: "عدد الأصناف",
      value: items.length,
      tone: "text-ink-900",
      isCount: true,
    },
    { label: "الإجمالي", value: total, tone: "text-ink-900" },
    { label: "الخصم", value: discount, tone: "text-negative" },
    { label: "الضريبة", value: tax, tone: "text-ink-600" },
    { label: "الصافي", value: net, tone: "text-primary-500" },
    { label: "المدفوع", value: paid, tone: "text-positive" },
    {
      label: "المتبقي",
      value: remaining,
      tone: remaining > 0 ? "text-negative" : "text-positive",
    },
  ];

  return (
    <LedgerPanel title="ملخص الفاتورة">
      {rows.map((row) => (
        <div key={row.label} className="flex items-stretch">
          <div className="w-28 shrink-0 bg-ink-900/[0.03] px-3 py-2 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            {row.label}
          </div>
          <div
            className={`flex-1 px-3 py-2 text-sm num font-medium flex items-center ${row.tone}`}
          >
            {row.value.toLocaleString("ar-EG")}
            {!row.isCount && ` ${symbol}`}
          </div>
        </div>
      ))}
    </LedgerPanel>
  );
}
