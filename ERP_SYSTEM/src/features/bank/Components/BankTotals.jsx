import { useGetBankSummaryQuery } from "../bankApi";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";

export default function BankTotals() {
  const { data, isLoading } = useGetBankSummaryQuery();

  if (isLoading) {
    return (
      <LedgerPanel title="ملخص الحسابات البنكية">
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-ink-400/10 rounded animate-pulse" />
          ))}
        </div>
      </LedgerPanel>
    );
  }

  const rows = [
    {
      label: "إجمالي التحويلات الواردة",
      value: data?.totalIn,
      tone: "text-positive",
    },
    {
      label: "إجمالي التحويلات الصادرة",
      value: data?.totalOut,
      tone: "text-negative",
    },
    {
      label: "إجمالي أرصدة البنوك",
      value: data?.currentBalance,
      tone: (data?.currentBalance ?? 0) >= 0 ? "text-primary-500 font-bold" : "text-negative font-bold",
    },
  ];

  return (
    <LedgerPanel title="ملخص الحسابات البنكية">
      {rows.map((row) => (
        <div key={row.label} className="flex items-stretch border-b border-ink-400/10 last:border-0">
          <div className="w-40 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 border-l border-ink-400/10 font-medium text-xs text-ink-600">
            {row.label}
          </div>
          <div className={`flex-1 px-3 py-2.5 font-semibold num ${row.tone}`}>
            {Number(row.value ?? 0).toLocaleString("ar-EG")} ج.م
          </div>
        </div>
      ))}
    </LedgerPanel>
  );
}