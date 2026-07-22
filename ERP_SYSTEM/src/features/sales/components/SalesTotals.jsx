import { useGetSaleSummaryQuery } from "../salesApi";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";

export default function SalesTotals({ invoiceId }) {
  const { data, isLoading } = useGetSaleSummaryQuery(invoiceId);

  if (isLoading) return <div>Loading...</div>;

  const summaryRows = [
    { label: "الإجمالي", value: data?.total, tone: "text-ink-900" },
    { label: "الخصم", value: data?.discount, tone: "text-negative" },
    { label: "الضريبة", value: data?.tax, tone: "text-ink-600" },
    { label: "المدفوع", value: data?.paid, tone: "text-positive" },
    {
      label: "الباقي",
      value: data?.remaining,
      tone: data?.remaining > 0 ? "text-negative" : "text-positive",
    },
  ];

  return (
    <LedgerPanel title="الإجماليات" className="mt-12">
      {summaryRows?.map((row) => (
        <div key={row.label} className="flex items-stretch ">
          <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 border-l">
            {row.label}
          </div>

          <div className={`flex-1 px-3 py-2.5 ${row.tone}`}>
            {Number(row.value ?? 0).toLocaleString("ar-EG")} ج.م
          </div>
        </div>
      ))}
    </LedgerPanel>
  );
}
