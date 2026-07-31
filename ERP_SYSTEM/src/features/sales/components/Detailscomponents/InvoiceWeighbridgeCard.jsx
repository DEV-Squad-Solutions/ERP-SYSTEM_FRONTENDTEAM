// features/sales/components/Detailscomponents/InvoiceWeighbridgeCard.jsx
import { Scale } from "lucide-react";

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceWeighbridgeCard({ invoice }) {
  const hasData =
    invoice.wbWeight || invoice.wbScaleDifference || invoice.wbDiscount;

  if (!hasData) return null;

  const rows = [
    { label: "وزن البسكال", value: invoice.wbWeight },
    { label: "فرق الميزان", value: invoice.wbScaleDifference },
    { label: "الخصم", value: invoice.wbDiscount },
    { label: "الاجمالي", value: invoice.wbTotal, highlight: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-5">
      <h3 className="font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
        <Scale size={16} />
        وزن البسكال
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`rounded-xl border p-3 ${
              row.highlight
                ? "border-primary-200 bg-primary-500/[0.04]"
                : "border-ink-400/10 bg-ink-900/[0.02]"
            }`}
          >
            <p className="text-xs text-ink-400 mb-1">{row.label}</p>
            <p className="text-sm font-bold num text-ink-900">
              {Number(row.value || 0).toLocaleString("ar-EG")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
