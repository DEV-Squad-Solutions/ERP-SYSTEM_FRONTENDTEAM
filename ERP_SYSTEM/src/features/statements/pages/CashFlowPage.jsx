import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useGetCashFlowQuery } from "../../statements/statementsApi";
import Pagination from "../../../shared/components/ui/Pagination";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

export default function CashFlowPage() {
  const [draft, setDraft] = useState({
    fromDate: firstOfMonthISO(),
    toDate: todayISO(),
    fiscalYearId: "",
    viewMode: "Summary",
    adjustmentView: "AfterAdjustments",
    includeUnmapped: false,
  });

  const [applied, setApplied] = useState(draft);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, isFetching, isError, refetch } = useGetCashFlowQuery(
    {
      fromDate: applied.fromDate,
      toDate: applied.toDate,
      fiscalYearId: applied.fiscalYearId || undefined,
      viewMode: applied.viewMode,
      adjustmentView: applied.adjustmentView,
      includeUnmapped: applied.includeUnmapped,
    },
  );

  const items = data?.items ?? [];
  const totals = data?.totals;
  const unmappedAccounts = data?.unmappedAccounts ?? [];

  const totalCount = items.length;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function handleShow() {
    setApplied(draft);
    setPage(1);
  }

  function handlePageSizeChange(size) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <div className="animate-fadeUp" dir="rtl">
      {" "}
      <div className="mb-5 flex items-start justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            {" "}
            <WalletCards size={20} className="text-primary-500" />
            قائمة التدفقات النقدية{" "}
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            التدفقات النقدية الناتجة عن القيود المؤثرة على حسابات الخزائن خلال
            الفترة
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-400/20 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-400/5"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">من تاريخ</label>

          <input
            type="date"
            value={draft.fromDate}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                fromDate: e.target.value,
              }))
            }
            className="rounded-xl border border-ink-400/20 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">إلى تاريخ</label>

          <input
            type="date"
            value={draft.toDate}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                toDate: e.target.value,
              }))
            }
            className="rounded-xl border border-ink-400/20 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">طريقة العرض</label>

          <select
            value={draft.viewMode}
            onChange={(e) => {
              setDraft((prev) => ({
                ...prev,
                viewMode: e.target.value,
              }));
              setPage(1);
            }}
            className="rounded-xl border border-ink-400/20 bg-white px-3 py-2 text-sm"
          >
            <option value="Summary">ملخص</option>
            <option value="Detailed">تفصيلي</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">التسويات</label>

          <select
            value={draft.adjustmentView}
            onChange={(e) => {
              setDraft((prev) => ({
                ...prev,
                adjustmentView: e.target.value,
              }));
              setPage(1);
            }}
            className="rounded-xl border border-ink-400/20 bg-white px-3 py-2 text-sm"
          >
            <option value="AfterAdjustments">بعد التسوية</option>
            <option value="BeforeAdjustments">قبل التسوية</option>
          </select>
        </div>

        <label className="flex h-[38px] cursor-pointer items-center gap-2 rounded-xl border border-ink-400/20 px-3 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={draft.includeUnmapped}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                includeUnmapped: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-primary-500"
          />
          عرض الحسابات غير المربوطة
        </label>

        <button
          type="button"
          onClick={handleShow}
          className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
        >
          عرض
        </button>
      </div>
      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل قائمة التدفقات النقدية...
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span>حدث خطأ أثناء تحميل قائمة التدفقات النقدية.</span>

          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium transition hover:bg-rose-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      {data && (
        <>
          {!data.isReadyForReporting && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">القائمة غير جاهزة للاعتماد</p>

                <p className="mt-1 text-sm">
                  توجد بيانات أو حسابات غير مكتملة قد تؤثر على التقرير.
                </p>
              </div>
            </div>
          )}

          {totals && (
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-ink-400">
                    صافي التدفق النقدي
                  </span>

                  {totals.netCashFlow >= 0 ? (
                    <TrendingUp size={20} className="text-primary-500" />
                  ) : (
                    <TrendingDown size={20} className="text-rose-500" />
                  )}
                </div>

                <p
                  className={`text-2xl font-bold ${
                    totals.netCashFlow >= 0
                      ? "text-primary-700"
                      : "text-rose-700"
                  }`}
                >
                  {fmt(totals.netCashFlow)}
                </p>

                <span className="text-xs text-ink-400">
                  {data.baseCurrency || "EGP"}
                </span>
              </div>

              <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-ink-400">إجمالي المدين</span>

                  <TrendingDown size={20} className="text-rose-500" />
                </div>

                <p className="text-2xl font-bold text-ink-900">
                  {fmt(totals.periodDebit)}
                </p>

                <span className="text-xs text-ink-400">
                  {data.baseCurrency || "EGP"}
                </span>
              </div>

              <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-ink-400">إجمالي الدائن</span>

                  <TrendingUp size={20} className="text-primary-500" />
                </div>

                <p className="text-2xl font-bold text-ink-900">
                  {fmt(totals.periodCredit)}
                </p>

                <span className="text-xs text-ink-400">
                  {data.baseCurrency || "EGP"}
                </span>
              </div>
            </div>
          )}

          <div
            className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
              isFetching ? "opacity-70" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead>
                  <tr className="bg-ink-400/5 text-xs text-ink-400">
                    <th className="px-3 py-2.5 text-right font-medium">
                      بند التدفقات النقدية
                    </th>

                    {applied.viewMode === "Detailed" && (
                      <th className="px-3 py-2.5 text-right font-medium">
                        الحساب
                      </th>
                    )}

                    <th className="px-3 py-2.5 text-right font-medium">
                      مدين الفترة
                    </th>

                    <th className="px-3 py-2.5 text-right font-medium">
                      دائن الفترة
                    </th>

                    <th className="px-3 py-2.5 text-right font-medium">
                      صافي التدفق
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={applied.viewMode === "Detailed" ? 5 : 4}
                        className="px-3 py-14 text-center text-ink-400"
                      >
                        لا توجد تدفقات نقدية لهذه الفترة
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((row, idx) => {
                      const net =
                        (row.periodDebit ?? 0) - (row.periodCredit ?? 0);

                      return (
                        <tr
                          key={`${row.financialStatementLineId}-${row.accountId ?? idx}`}
                          className="border-t border-ink-400/10 transition-colors hover:bg-ink-900/[0.015]"
                        >
                          <td className="px-3 py-3">
                            <div>
                              <span className="font-medium text-ink-800">
                                {row.financialStatementLineName || "—"}
                              </span>

                              {row.financialStatementLineCode && (
                                <span className="mr-2 text-[11px] text-ink-400">
                                  {row.financialStatementLineCode}
                                </span>
                              )}
                            </div>
                          </td>

                          {applied.viewMode === "Detailed" && (
                            <td className="px-3 py-3">
                              <span className="block font-medium text-ink-800">
                                {row.accountName || "—"}
                              </span>

                              {row.accountCode && (
                                <span className="text-[11px] text-ink-400">
                                  {row.accountCode}
                                </span>
                              )}
                            </td>
                          )}

                          <td className="whitespace-nowrap px-3 py-3 text-ink-700">
                            {fmt(row.periodDebit)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-ink-700">
                            {fmt(row.periodCredit)}
                          </td>

                          <td
                            className={`whitespace-nowrap px-3 py-3 font-semibold ${
                              net >= 0 ? "text-primary-700" : "text-rose-700"
                            }`}
                          >
                            {fmt(net)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {totals && items.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-ink-400/20 bg-ink-400/5 font-bold text-ink-900">
                      <td
                        className="px-3 py-3"
                        colSpan={applied.viewMode === "Detailed" ? 2 : 1}
                      >
                        الإجمالي
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {fmt(totals.periodDebit)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {fmt(totals.periodCredit)}
                      </td>

                      <td
                        className={`whitespace-nowrap px-3 py-3 ${
                          totals.netCashFlow >= 0
                            ? "text-primary-700"
                            : "text-rose-700"
                        }`}
                      >
                        {fmt(totals.netCashFlow)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              label="بند"
            />
          )}

          {applied.includeUnmapped && unmappedAccounts.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-card">
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={18} />

                  <h3 className="font-semibold">حسابات غير مربوطة</h3>
                </div>

                <p className="mt-1 text-xs text-amber-600">
                  هذه الحسابات المقابلة لها حركة نقدية ولكن لم يتم ربطها ببند
                  تدفقات نقدية.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-ink-400/5 text-xs text-ink-400">
                      <th className="px-4 py-2.5 text-right font-medium">
                        الحساب
                      </th>

                      <th className="px-4 py-2.5 text-right font-medium">
                        مدين الفترة
                      </th>

                      <th className="px-4 py-2.5 text-right font-medium">
                        دائن الفترة
                      </th>

                      <th className="px-4 py-2.5 text-right font-medium">
                        صافي الحركة
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {unmappedAccounts.map((row) => {
                      const net =
                        (row.periodDebit ?? 0) - (row.periodCredit ?? 0);

                      return (
                        <tr
                          key={row.accountId}
                          className="border-t border-ink-400/10"
                        >
                          <td className="px-4 py-3">
                            <span className="block font-medium text-ink-800">
                              {row.accountName || "—"}
                            </span>

                            {row.accountCode && (
                              <span className="text-[11px] text-ink-400">
                                {row.accountCode}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">{fmt(row.periodDebit)}</td>

                          <td className="px-4 py-3">{fmt(row.periodCredit)}</td>

                          <td
                            className={`px-4 py-3 font-semibold ${
                              net >= 0 ? "text-primary-700" : "text-rose-700"
                            }`}
                          >
                            {fmt(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.isReadyForReporting && (
            <div className="mt-4 flex items-center gap-2 text-xs text-primary-600">
              <CheckCircle2 size={15} />
              قائمة التدفقات النقدية جاهزة للتقرير.
            </div>
          )}
        </>
      )}
    </div>
  );
}
