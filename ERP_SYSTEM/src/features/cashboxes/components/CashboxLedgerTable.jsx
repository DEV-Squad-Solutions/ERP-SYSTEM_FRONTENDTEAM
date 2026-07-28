import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";

/**
 * @param {{ data: Object, isLoading: boolean, isFetching: boolean, isError: boolean, refetch: () => void }} props
 */
export default function CashboxLedgerTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
}) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-ink-400/5 animate-pulse" />
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
          حدث خطأ في تحميل حركة الخزنة
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

  const vouchers = data?.items || [];

  if (!isFetching && vouchers.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">لا توجد حركات مسجلة</p>
        <p className="text-sm text-ink-400">ابدأ بتسجيل أول سند</p>
      </div>
    );
  }

  // ترتيب زمني وحساب رصيد تراكمي: استلام = مدين (+)، صرف = دائن (-)
  const sorted = [...vouchers].sort((a, b) =>
    a.voucherDate.localeCompare(b.voucherDate),
  );
  let running = 0;
  const rows = sorted.map((v) => {
    const debit = v.direction === "Receipt" ? v.amount : 0;
    const credit = v.direction === "Payment" ? v.amount : 0;
    running += debit - credit;
    return { ...v, debit, credit, balance: running };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div
      className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <table className="w-full text-right border-collapse min-w-[950px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              رقم السند
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5 text-positive">
              مدين
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5 text-negative">
              دائن
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الرصيد
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              البيان
            </th>
            <th className="p-2.5 font-medium">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01] transition-colors"
            >
              <td className="p-2.5 num text-ink-600 border-l border-ink-400/5">
                {row.voucherDate}
              </td>
              <td className="p-2.5 num font-medium text-ink-900 border-l border-ink-400/5">
                {row.voucherNumber}
              </td>
              <td className="p-2.5 num text-positive border-l border-ink-400/5">
                {row.debit > 0 ? row.debit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-2.5 num text-negative border-l border-ink-400/5">
                {row.credit > 0 ? row.credit.toLocaleString("ar-EG") : "—"}
              </td>
              <td
                className={`p-2.5 num font-semibold border-l border-ink-400/5 ${row.balance >= 0 ? "text-ink-900" : "text-negative"}`}
              >
                {row.balance.toLocaleString("ar-EG")}
              </td>
              <td
                className="p-2.5 text-ink-700 border-l border-ink-400/5 max-w-[220px] truncate"
                title={row.description}
              >
                {row.description}
                {row.businessPartnerName && (
                  <span className="block text-xs text-ink-400">
                    {row.businessPartnerName}
                  </span>
                )}
                {row.driverName && (
                  <span className="block text-xs text-ink-400">
                    {row.driverName}
                  </span>
                )}
              </td>
              <td
                className="p-2.5 text-ink-400 text-xs max-w-[180px] truncate"
                title={row.notes}
              >
                {row.notes || "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
            <td className="p-2.5" colSpan={2}>
              الإجمالي
            </td>
            <td className="p-2.5 num text-positive">
              {totalDebit.toLocaleString("ar-EG")}
            </td>
            <td className="p-2.5 num text-negative">
              {totalCredit.toLocaleString("ar-EG")}
            </td>
            <td className="p-2.5 num">{running.toLocaleString("ar-EG")}</td>
            <td className="p-2.5" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
