import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";
import BalanceBadge from "./BalanceBadge";
import Pagination from "../../../shared/components/ui/Pagination";

/**
 * @param {{
 * data: Object,
 * isLoading: boolean,
 * isFetching: boolean,
 * isError: boolean,
 * refetch: () => void
 * }} props
 */
export default function StatementTable({
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
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-400/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
        <AlertCircle
          size={34}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />

        <p className="mb-1 font-medium text-ink-900">
          حدث خطأ في تحميل كشف الحساب
        </p>

        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];
  const currency = data?.currency || "EGP";
  const baseCurrency = data?.baseCurrency || "EGP";
  const isForeign = currency !== baseCurrency;

  if (!isFetching && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>

        <p className="font-medium text-ink-900">لا توجد حركات مطابقة</p>
      </div>
    );
  }

  const fmt = (n) => (n ?? 0).toLocaleString("ar-EG");

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
        isFetching ? "opacity-60" : ""
      }`}
    >
      {isForeign && (
        <div className="flex items-center gap-2 border-b border-ink-400/10 bg-primary-50/40 px-5 py-2.5 text-xs font-medium text-primary-600">
          <span>
            عميل بعملة أجنبية — المبالغ معروضة بعملة الحساب ({currency}) وما
            يقابلها بالمصري ({baseCurrency})
          </span>
        </div>
      )}

      <div className="overflow-x-auto custom-scroll">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
              <th className="w-48 px-4 py-3 text-center">الرصيد</th>

              <th className="w-32 px-4 py-3 text-center text-positive">
                مدين{" "}
                {isForeign && (
                  <span className="text-[10px] text-ink-400">({currency})</span>
                )}
              </th>

              <th className="w-32 px-4 py-3 text-center text-negative">
                دائن{" "}
                {isForeign && (
                  <span className="text-[10px] text-ink-400">({currency})</span>
                )}
              </th>

              <th className="min-w-[320px] px-4 py-3 text-right">البيان</th>

              <th className="w-36 px-4 py-3 text-center">التاريخ</th>

              <th className="min-w-[220px] px-4 py-3 text-right">الملاحظات</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-ink-400/5 transition-colors hover:bg-slate-50 last:border-0"
              >
                {/* الرصيد */}
                <td className="px-4 py-3 text-center">
                  <BalanceBadge
                    amount={item.balanceAmount}
                    description={item.balanceDescription}
                  />

                  {isForeign && (
                    <div className="num mt-1 text-[11px] text-ink-400">
                      {fmt(item.baseBalanceAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* مدين */}
                <td className="num px-4 py-3 text-center font-medium text-positive">
                  {item.debitAmount > 0 ? fmt(item.debitAmount) : "—"}

                  {isForeign && item.debitAmount > 0 && (
                    <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                      {fmt(item.baseDebitAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* دائن */}
                <td className="num px-4 py-3 text-center font-medium text-negative">
                  {item.creditAmount > 0 ? fmt(item.creditAmount) : "—"}

                  {isForeign && item.creditAmount > 0 && (
                    <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                      {fmt(item.baseCreditAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* البيان */}
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-ink-900">
                    {item.description || "—"}
                  </div>
                </td>

                {/* التاريخ */}
                <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-600">
                  {item.date}
                </td>

                {/* الملاحظات */}
                <td className="px-4 py-3 text-right text-ink-500">
                  {item.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.summary && (
        <div className="border-t border-ink-400/10 bg-slate-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-500">رصيد أول المدة</span>

              <div className="flex flex-col items-start">
                <BalanceBadge
                  amount={data.summary.openingBalanceAmount}
                  description={data.summary.openingBalanceDescription}
                />

                {isForeign && (
                  <span className="num mt-1 text-[11px] text-ink-400">
                    {fmt(data.summary.baseOpeningBalanceAmount)} {baseCurrency}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-900">
                رصيد آخر المدة
              </span>

              <div className="flex flex-col items-start">
                <BalanceBadge
                  amount={data.summary.closingBalanceAmount}
                  description={data.summary.closingBalanceDescription}
                />

                {isForeign && (
                  <span className="num mt-1 text-[11px] text-ink-400">
                    {fmt(data.summary.baseClosingBalanceAmount)} {baseCurrency}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {data?.totalPages > 0 && (
        <div className="border-t border-ink-400/10 bg-white px-5 py-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={data?.totalCount || 0}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            label="حركة"
          />
        </div>
      )}
    </div>
  );
}
