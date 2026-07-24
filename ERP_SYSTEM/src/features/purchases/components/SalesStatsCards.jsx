import { FileText, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { useGetSalesSummaryQuery } from "../salesApi";

/**
 * @param {{ filters: Object }} props
 */
export default function SalesStatsCards({ filters }) {
  const { data: summary, isLoading } = useGetSalesSummaryQuery(filters);

  const cards = [
    {
      label: "عدد الفواتير",
      value: summary?.invoicesCount,
      icon: FileText,
      tone: "text-primary-500 bg-primary-50",
      isCount: true,
    },
    {
      label: "إجمالي البيع",
      value: summary?.totalAmount,
      icon: TrendingUp,
      tone: "text-ink-900 bg-ink-400/10",
    },
    {
      label: "المدفوع",
      value: summary?.totalPaid,
      icon: Wallet,
      tone: "text-positive bg-positive/10",
    },
    {
      label: "المتبقي",
      value: summary?.totalRemaining,
      icon: AlertCircle,
      tone: "text-negative bg-negative/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}
          >
            <card.icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink-400">{card.label}</p>
            {isLoading ? (
              <div className="h-5 w-16 rounded bg-ink-400/10 animate-pulse mt-1" />
            ) : (
              <p className="num font-bold text-ink-900 text-sm truncate">
                {card.isCount
                  ? (card.value ?? 0)
                  : `${(card.value ?? 0).toLocaleString("ar-EG")} ج.م`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
