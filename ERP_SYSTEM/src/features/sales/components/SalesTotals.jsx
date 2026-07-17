import { useGetSaleLinesQuery } from "../salesApi";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";

export default function SalesTotals({ filters }) {
  const { data: rows } = useGetSaleLinesQuery(filters);

  if (!rows || rows.length === 0) return null;

  // مجموع قيمة كل الأصناف
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  // خصم/ضريبة/مدفوع بتتحسب مرة واحدة لكل فاتورة (مش لكل صنف) عشان منكررش
  const uniqueInvoices = [
    ...new Map(rows.map((r) => [r.invoiceNumber, r])).values(),
  ];
  const discount = uniqueInvoices.reduce(
    (sum, r) => sum + (r.invoiceDiscount || 0),
    0,
  );
  const tax = uniqueInvoices.reduce((sum, r) => sum + (r.invoiceTax || 0), 0);
  const paid = uniqueInvoices.reduce((sum, r) => sum + (r.invoicePaid || 0), 0);
  const remaining = total - discount + tax - paid;

  const summaryRows = [
    { label: "الإجمالي", value: total, tone: "text-ink-900" },
    { label: "الخصم", value: discount, tone: "text-negative" },
    { label: "الضريبة", value: tax, tone: "text-ink-600" },
    { label: "المدفوع", value: paid, tone: "text-positive" },
    {
      label: "الباقي",
      value: remaining,
      tone: remaining > 0 ? "text-negative" : "text-positive",
    },
  ];

  return (
    <LedgerPanel title="الإجماليات" className=" mr-0 ml-auto mt-4 ">
      {summaryRows.map((row) => (
        <div key={row.label} className="flex items-stretch">
          <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            {row.label}
          </div>
          <div
            className={`flex-1 px-3 py-2.5 text-sm num font-medium flex items-center ${row.tone}`}
          >
            {row.value.toLocaleString("ar-EG")} ج.م
          </div>
        </div>
      ))}
    </LedgerPanel>
  );
}
