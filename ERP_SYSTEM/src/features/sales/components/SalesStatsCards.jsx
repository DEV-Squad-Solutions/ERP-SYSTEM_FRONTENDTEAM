import {
  FileText,
  TrendingUp,
  Wallet,
  AlertCircle,
  BadgePercent,
} from "lucide-react";

/**
 * @param {{
 *   summary: {
 *     subtotal: number,
 *     discountAmount: number,
 *     total: number,
 *     paidAmount: number,
 *     remainingAmount: number,
 *   },
 *   isLoading?: boolean
 * }} props
 */
export default function SalesStatsCards({ summary, isLoading }) {
  const cards = [
    {
      label: "إجمالي قبل الخصم",
      value: summary?.subtotal,
      icon: TrendingUp,
      tone: "text-ink-900 bg-ink-400/10",
    },
    {
      label: "الخصم",
      value: summary?.discountAmount,
      icon: BadgePercent,
      tone: "text-warning bg-warning/10",
    },
    {
      label: "الإجمالي",
      value: summary?.total,
      icon: FileText,
      tone: "text-primary-500 bg-primary-50",
    },
    {
      label: "المدفوع",
      value: summary?.paidAmount,
      icon: Wallet,
      tone: "text-positive bg-positive/10",
    },
    {
      label: "المتبقي",
      value: summary?.remainingAmount,
      icon: AlertCircle,
      tone: "text-negative bg-negative/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
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

          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-400">{card.label}</p>

            {isLoading ? (
              <div className="h-5 w-16 rounded bg-ink-400/10 animate-pulse mt-1" />
            ) : (
              <p className="num font-bold text-ink-900 text-sm truncate">
                {(Number(card.value) || 0).toLocaleString("ar-EG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ج.م
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
