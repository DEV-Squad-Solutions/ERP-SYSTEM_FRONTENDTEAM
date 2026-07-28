import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";
import BalanceBadge from "./BalanceBadge";

/**
 * @param {{ data: Object, isLoading: boolean, isFetching: boolean, isError: boolean, refetch: () => void }} props
 */
export default function StatementTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle
          size={34}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium mb-1">
          حدث خطأ في تحميل كشف الحساب
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];
  const symbol = data?.currency === "USD" ? "$" : "ج.م";

  if (!isFetching && items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">لا توجد حركات مطابقة</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <table className="w-full text-right border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-3 font-medium">التاريخ</th>
            <th className="p-3 font-medium">رقم المستند</th>
            <th className="p-3 font-medium">مصدر الحركة</th>
            <th className="p-3 font-medium text-negative">عليه</th>
            <th className="p-3 font-medium text-positive">له</th>
            <th className="p-3 font-medium">الرصيد</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01] transition-colors"
            >
              <td className="p-3 num text-ink-600">{item.date}</td>
              <td className="p-3 num font-medium text-ink-900">
                {item.documentNumber || "—"}
              </td>
              <td className="p-3 text-ink-700">{item.movementName}</td>
              <td className="p-3 num text-negative">
                {item.debitAmount > 0
                  ? item.debitAmount.toLocaleString("ar-EG")
                  : "—"}
              </td>
              <td className="p-3 num text-positive">
                {item.creditAmount > 0
                  ? item.creditAmount.toLocaleString("ar-EG")
                  : "—"}
              </td>
              <td className="p-3">
                <BalanceBadge
                  amount={item.balanceAmount}
                  description={item.balanceDescription}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data?.summary && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary-100 bg-primary-50/50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-ink-500">رصيد أول المدة</span>
            <BalanceBadge
              amount={data.summary.openingBalanceAmount}
              description={data.summary.openingBalanceDescription}
            />
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-ink-900">رصيد آخر المدة</span>
            <BalanceBadge
              amount={data.summary.closingBalanceAmount}
              description={data.summary.closingBalanceDescription}
            />
          </div>
        </div>
      )}
    </div>
  );
}
