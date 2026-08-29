// features/statements/components/EmployeeStatementTable.jsx
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

const SOURCE_TYPE_LABELS = {
  OpeningBalance: "رصيد افتتاحي",
  SalaryTransfer: "تحويل راتب",
  Movement: "حركة",
  CashVoucher: "سند نقدي",
};

function SummaryCard({ label, value, currency, tone = "neutral" }) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : "text-ink-900";
  return (
    <div className="rounded-xl border border-ink-400/10 bg-white/60 p-3">
      <p className="text-xs text-ink-400">{label}</p>
      <p className={`mt-1 text-sm font-bold sm:text-base ${toneClass}`}>
        {fmt(value)} <span className="text-xs font-normal">{currency}</span>
      </p>
    </div>
  );
}

export default function EmployeeStatementTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-ink-400/10 bg-white/40">
        <RefreshCw size={20} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-ink-400/10 bg-white/40">
        <p className="text-sm text-rose-600">حدث خطأ أثناء تحميل كشف الحساب</p>
        <button
          onClick={refetch}
          className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs text-white"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];
  const summary = data?.summary;
  const currency = data?.currency || "EGP";
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-3">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryCard
            label="رصيد افتتاحي"
            value={summary.openingBalanceAmount}
            currency={currency}
          />
          <SummaryCard
            label="إجمالي مدين"
            value={summary.totalDebits}
            currency={currency}
            tone="negative"
          />
          <SummaryCard
            label="إجمالي دائن"
            value={summary.totalCredits}
            currency={currency}
            tone="positive"
          />
          <SummaryCard
            label="رصيد ختامي"
            value={summary.closingBalanceAmount}
            currency={currency}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-ink-400/10 bg-white/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-ink-400/10 bg-ink-400/5 text-xs text-ink-400">
              <th className="px-3 py-2 text-right font-medium">التاريخ</th>
              <th className="px-3 py-2 text-right font-medium">النوع</th>
              <th className="px-3 py-2 text-right font-medium">رقم المستند</th>
              <th className="px-3 py-2 text-right font-medium">الوصف</th>
              <th className="px-3 py-2 text-right font-medium">مدين</th>
              <th className="px-3 py-2 text-right font-medium">دائن</th>
              <th className="px-3 py-2 text-right font-medium">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-xs text-ink-400"
                >
                  لا توجد حركات في هذه الفترة
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.sourceId + item.date + item.documentNumber}
                  className="border-b border-ink-400/5 hover:bg-ink-400/5"
                >
                  <td className="px-3 py-2 whitespace-nowrap">{item.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {SOURCE_TYPE_LABELS[item.sourceType] || item.sourceType}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.documentNumber}
                  </td>
                  <td className="px-3 py-2">
                    <div>{item.movementName}</div>
                    {item.description && (
                      <div className="text-xs text-ink-400">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-rose-600">
                    {item.debitAmount ? fmt(item.debitAmount) : "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-emerald-600">
                    {item.creditAmount ? fmt(item.creditAmount) : "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">
                    {fmt(item.balanceAmount)}
                    {item.balanceDescription && (
                      <span className="ms-1 text-xs text-ink-400">
                        ({item.balanceDescription})
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <span>
            {data?.totalCount ?? 0} حركة{isFetching && "  •  جاري التحديث..."}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 rounded-md border border-ink-400/15 bg-white px-2 text-xs"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / صفحة
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md p-1.5 hover:bg-ink-400/5 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
          <span className="px-2 text-xs text-ink-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md p-1.5 hover:bg-ink-400/5 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
