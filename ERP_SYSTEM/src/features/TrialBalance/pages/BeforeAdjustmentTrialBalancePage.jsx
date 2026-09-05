import { useState } from "react";
import { Scale, RefreshCw } from "lucide-react";
import { useGetOperationalTrialBalanceQuery } from "../../statements/statementsApi";

const CATEGORY_LABELS = {
  Cashbox: "خزينة",
  Partner: "عميل / مورد",
  Driver: "سائق",
  Employee: "موظف",
  Revenue: "إيراد",
  Expense: "مصروف",
};

const CATEGORY_OPTIONS = [
  { value: "", label: "كل التصنيفات" },
  { value: "Cashbox", label: "خزائن" },
  { value: "Partner", label: "عملاء وموردين" },
  { value: "Driver", label: "سائقين" },
  { value: "Employee", label: "موظفين" },
  { value: "Revenue", label: "إيرادات" },
  { value: "Expense", label: "مصروفات" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthISO() {
  const d = new Date();
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    1
  )
    .toISOString()
    .slice(0, 10);
}

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

export default function BeforeAdjustmentTrialBalancePage() {
  const [draft, setDraft] = useState({
    fromDate: firstOfMonthISO(),
    toDate: todayISO(),
    viewMode: "Summary",
    category: "",
    includeZeroBalances: false,
  });

  const [applied, setApplied] = useState(draft);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOperationalTrialBalanceQuery({
      ...applied,
      AdjustmentView: "BeforeAdjustments",
    });

  const items = data?.items ?? [];
  const totals = data?.totals;

  function handleShow() {
    setApplied(draft);
  }

  return (
    <div className="animate-fadeUp">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Scale size={20} className="text-primary-500" />
            ميزان المراجعة قبل التسوية
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            حركات الحسابات خلال الفترة قبل قيود التسوية
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-400/20 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-400/5"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
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
          <label className="text-xs text-ink-400">التصنيف</label>

          <select
            value={draft.category}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className="rounded-xl border border-ink-400/20 px-3 py-2 text-sm"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">طريقة العرض</label>

          <div className="flex overflow-hidden rounded-xl border border-ink-400/20">
            {["Summary", "Detailed"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    viewMode: mode,
                  }))
                }
                className={`px-3 py-2 text-sm transition ${
                  draft.viewMode === mode
                    ? "bg-primary-500 text-white"
                    : "bg-white text-ink-600 hover:bg-ink-400/5"
                }`}
              >
                {mode === "Summary" ? "إجمالي" : "تفصيلي"}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={draft.includeZeroBalances}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                includeZeroBalances: e.target.checked,
              }))
            }
            className="rounded border-ink-400/30"
          />
          إظهار الحسابات الصفرية
        </label>

        <button
          type="button"
          onClick={handleShow}
          className="mb-0 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
        >
          عرض
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل ميزان المراجعة...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span>حدث خطأ أثناء تحميل ميزان المراجعة.</span>

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
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm" dir="rtl">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="px-3 py-2.5 text-right font-medium">
                    التصنيف
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    الحساب
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    مدين الفترة
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    دائن الفترة
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-14 text-center text-ink-400"
                    >
                      لا توجد بيانات لهذه الفترة
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => (
                    <tr
                      key={`${row.category}-${row.accountId ?? idx}`}
                      className="border-t border-ink-400/10 transition-colors hover:bg-ink-900/[0.015]"
                    >
                      <td className="px-3 py-2.5">
                        <span className="inline-flex whitespace-nowrap rounded-md bg-primary-500/10 px-2 py-1 text-[11px] text-primary-600">
                          {CATEGORY_LABELS[row.category] ||
                            row.categoryName ||
                            row.category}
                        </span>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="block truncate font-medium text-ink-800">
                          {row.accountName || "—"}
                        </span>

                        {row.accountCode && (
                          <span className="text-[11px] text-ink-400">
                            {row.accountCode}
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-primary-600">
                        {fmt(row.periodDebit)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-rose-600">
                        {fmt(row.periodCredit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {totals && items.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-ink-400/20 bg-ink-400/5 font-bold text-ink-900">
                    <td className="px-3 py-3" colSpan={2}>
                      الإجمالي
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-primary-700">
                      {fmt(totals.periodDebit)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-rose-700">
                      {fmt(totals.periodCredit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
