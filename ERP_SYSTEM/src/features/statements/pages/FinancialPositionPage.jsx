import { useOnFiscalYearChange } from "../../../lib/useOnFiscalYearChange";
import { resetRangeIfOutside } from "../../../lib/fiscalYearDateRange";
import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  Landmark,
  CheckCircle2,
  RefreshCw,
  Scale,
  Wallet,
} from "lucide-react";
import { useGetFinancialPositionQuery } from "../../statements/statementsApi";
import { Printer } from "lucide-react";
import { useFinancialPositionPrint } from "../../../shared/hooks/useFinancialPositionPrint";
import FinancialPositionPrintTemplate from "../../../shared/components/print/FinancialPositionPrintTemplate";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(
    n ?? 0,
  );
}

const SECTIONS = [
  { key: "Asset", title: "الأصول", nature: "debit" },
  { key: "Liability", title: "الالتزامات", nature: "credit" },
  { key: "Equity", title: "حقوق الملكية", nature: "credit" },
  { key: "Other", title: "أخرى", nature: "debit" },
];

function sectionKeyOf(accountType) {
  const t = String(accountType ?? "").toLowerCase();
  if (t.startsWith("asset")) return "Asset";
  if (t.startsWith("liabilit")) return "Liability";
  if (t.startsWith("equit")) return "Equity";
  return "Other";
}

// الأصول = مدين - دائن ، الالتزامات/الملكية = دائن - مدين
function rowValues(nature, row) {
  const s = (d, c) =>
    nature === "debit" ? (d ?? 0) - (c ?? 0) : (c ?? 0) - (d ?? 0);
  return {
    opening: s(row.openingDebit, row.openingCredit),
    movement: s(row.periodDebit, row.periodCredit),
    closing: s(row.closingDebit, row.closingCredit),
  };
}

function buildSections(items = []) {
  return SECTIONS.map((sec) => {
    const rows = items
      .filter((r) => sectionKeyOf(r.accountType) === sec.key)
      .map((r) => ({ ...r, v: rowValues(sec.nature, r) }));
    const sum = rows.reduce(
      (a, r) => ({
        opening: a.opening + r.v.opening,
        movement: a.movement + r.v.movement,
        closing: a.closing + r.v.closing,
      }),
      { opening: 0, movement: 0, closing: 0 },
    );
    return { ...sec, rows, sum };
  }).filter((sec) => sec.rows.length > 0);
}

function summarize(sections, totals) {
  const sumOf = (key) => sections.find((x) => x.key === key)?.sum.closing ?? 0;
  const totalAssets = totals?.totalAssets ?? sumOf("Asset");
  const totalLE =
    totals?.totalLiabilitiesAndEquity ?? sumOf("Liability") + sumOf("Equity");
  const difference = totalAssets - totalLE;
  const balanced = totals?.isBalanced ?? Math.abs(difference) < 0.005;
  return { totalAssets, totalLE, difference, balanced };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function Amount({ value, bold = false }) {
  return (
    <span
      className={`whitespace-nowrap tabular-nums ${bold ? "font-semibold" : ""} ${
        value < 0 ? "text-rose-700" : "text-ink-800"
      }`}
    >
      {fmt(value)}
    </span>
  );
}

export default function FinancialPositionPage({ companyName = "" }) {
  const [draft, setDraft] = useState({
    fromDate: firstOfMonthISO(),
    toDate: todayISO(),
    fiscalYearId: "",
    viewMode: "Summary",
    adjustmentView: "AfterAdjustments",
    includeUnmapped: false,
  });
  const [applied, setApplied] = useState(draft);

  useOnFiscalYearChange((fy) => {
    const fix = (f) =>
      f.fiscalYearId ? f : resetRangeIfOutside(f, "fromDate", "toDate", fy);
    setDraft(fix);
    setApplied(fix);
  });

  const { data, isLoading, isFetching, isError, refetch } =
    useGetFinancialPositionQuery({
      fromDate: applied.fromDate,
      toDate: applied.toDate,
      fiscalYearId: applied.fiscalYearId || undefined,
      viewMode: applied.viewMode,
      adjustmentView: applied.adjustmentView,
      includeUnmapped: applied.includeUnmapped,
    });

  const items = data?.items ?? [];
  const totals = data?.totals;
  const unmappedAccounts = data?.unmappedAccounts ?? [];
  const isDetailed = applied.viewMode === "Detailed";

  const sections = useMemo(() => buildSections(items), [items]);
  const { totalAssets, totalLE, difference, balanced } = summarize(
    sections,
    totals,
  );

  const { printReport, printRef } = useFinancialPositionPrint();

  const colCount = 4;

  return (
    <div className="animate-fadeUp" dir="rtl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Landmark size={20} className="text-primary-500" />
            قائمة المركز المالي
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            الأصول والالتزامات وحقوق الملكية حتى تاريخ نهاية الفترة من القيود
            المرحلة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => printReport()}
            disabled={!data || items.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-400/20 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-400/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={16} />
            طباعة
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-400/20 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-400/5"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">من تاريخ</label>
          <input
            type="date"
            value={draft.fromDate}
            onChange={(e) =>
              setDraft((p) => ({ ...p, fromDate: e.target.value }))
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
              setDraft((p) => ({ ...p, toDate: e.target.value }))
            }
            className="rounded-xl border border-ink-400/20 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-400">طريقة العرض</label>
          <select
            value={draft.viewMode}
            onChange={(e) =>
              setDraft((p) => ({ ...p, viewMode: e.target.value }))
            }
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
            onChange={(e) =>
              setDraft((p) => ({ ...p, adjustmentView: e.target.value }))
            }
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
              setDraft((p) => ({ ...p, includeUnmapped: e.target.checked }))
            }
            className="h-4 w-4 accent-primary-500"
          />
          عرض الحسابات غير المربوطة
        </label>

        <button
          type="button"
          onClick={() => setApplied(draft)}
          className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
        >
          عرض
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل قائمة المركز المالي...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span>حدث خطأ أثناء تحميل قائمة المركز المالي.</span>
          <button
            type="button"
            onClick={() => refetch()}
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
                  قد يكون السبب تكلفة مخزون معلقة أو فرق جرد غير مسوى، أو وجود
                  حسابات غير مربوطة. فعّل «عرض الحسابات غير المربوطة» للمراجعة.
                </p>
              </div>
            </div>
          )}

          {/* الكروت */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-400">إجمالي الأصول</span>
                <Wallet size={20} className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-ink-900">
                {fmt(totalAssets)}
              </p>
              <span className="text-xs text-ink-400">
                {data.baseCurrency || "EGP"}
              </span>
            </div>

            <div className="rounded-2xl border border-ink-400/10 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-400">
                  الالتزامات وحقوق الملكية
                </span>
                <Scale size={20} className="text-gold-500" />
              </div>
              <p className="text-2xl font-bold text-ink-900">{fmt(totalLE)}</p>
              <span className="text-xs text-ink-400">
                {data.baseCurrency || "EGP"}
              </span>
            </div>

            <div
              className={`rounded-2xl border p-5 shadow-card ${
                balanced
                  ? "border-primary-500/20 bg-primary-500/5"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-500">توازن الميزانية</span>
                {balanced ? (
                  <CheckCircle2 size={20} className="text-primary-600" />
                ) : (
                  <AlertTriangle size={20} className="text-rose-600" />
                )}
              </div>
              <p
                className={`text-2xl font-bold ${
                  balanced ? "text-primary-700" : "text-rose-700"
                }`}
              >
                {balanced ? "متوازنة" : fmt(difference)}
              </p>
              <span className="text-xs text-ink-400">
                {balanced ? "الأصول = الالتزامات + الملكية" : "فرق بين الطرفين"}
              </span>
            </div>
          </div>

          {/* الجدول */}
          <div
            className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
              isFetching ? "opacity-70" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="bg-ink-400/5 text-xs text-ink-400">
                    <th className="px-3 py-2.5 text-right font-medium">
                      {isDetailed ? "الحساب" : "بند القائمة"}
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      رصيد أول المدة
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      حركة الفترة
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      رصيد آخر المدة
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sections.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colCount}
                        className="px-3 py-14 text-center text-ink-400"
                      >
                        لا توجد بيانات لهذه الفترة
                      </td>
                    </tr>
                  ) : (
                    sections.map((section) => (
                      <Fragment key={section.key}>
                        <tr className="border-t-2 border-ink-400/20 bg-primary-500/5">
                          <td
                            colSpan={colCount}
                            className="px-3 py-2 text-sm font-bold text-ink-900"
                          >
                            {section.title}
                          </td>
                        </tr>

                        {section.rows.map((row, idx) => {
                          const v = row.v;
                          return (
                            <tr
                              key={`${section.key}-${row.financialStatementLineId}-${row.accountId ?? idx}`}
                              className="border-t border-ink-400/10 transition-colors hover:bg-ink-900/[0.015]"
                            >
                              <td className="px-3 py-2.5 pr-6">
                                {isDetailed ? (
                                  <>
                                    <span className="font-medium text-ink-800">
                                      {row.accountName || "—"}
                                    </span>
                                    {row.accountCode && (
                                      <span className="mr-2 text-[11px] text-ink-400">
                                        {row.accountCode}
                                      </span>
                                    )}
                                    {row.financialStatementLineName && (
                                      <span className="block text-[11px] text-ink-400">
                                        {row.financialStatementLineName}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium text-ink-800">
                                      {row.financialStatementLineName || "—"}
                                    </span>
                                    {row.financialStatementLineCode && (
                                      <span className="mr-2 text-[11px] text-ink-400">
                                        {row.financialStatementLineCode}
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <Amount value={v.opening} />
                              </td>
                              <td className="px-3 py-2.5">
                                <Amount value={v.movement} />
                              </td>
                              <td className="px-3 py-2.5">
                                <Amount value={v.closing} bold />
                              </td>
                            </tr>
                          );
                        })}

                        <tr className="border-t border-ink-400/20 bg-ink-400/5 font-bold">
                          <td className="px-3 py-2.5 text-ink-900">
                            إجمالي {section.title}
                          </td>
                          <td className="px-3 py-2.5">
                            <Amount value={section.sum.opening} bold />
                          </td>
                          <td className="px-3 py-2.5">
                            <Amount value={section.sum.movement} bold />
                          </td>
                          <td className="px-3 py-2.5">
                            <Amount value={section.sum.closing} bold />
                          </td>
                        </tr>
                      </Fragment>
                    ))
                  )}
                </tbody>

                {sections.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-ink-400/30 font-bold text-ink-900">
                      <td className="px-3 py-3">إجمالي الأصول</td>
                      <td colSpan={2} />
                      <td className="px-3 py-3">
                        <Amount value={totalAssets} bold />
                      </td>
                    </tr>
                    <tr className="font-bold text-ink-900">
                      <td className="px-3 py-3">
                        إجمالي الالتزامات وحقوق الملكية
                      </td>
                      <td colSpan={2} />
                      <td className="px-3 py-3">
                        <Amount value={totalLE} bold />
                      </td>
                    </tr>
                    {!balanced && (
                      <tr className="bg-rose-50 font-bold text-rose-700">
                        <td className="px-3 py-3">الفرق</td>
                        <td colSpan={2} />
                        <td className="px-3 py-3">{fmt(difference)}</td>
                      </tr>
                    )}
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* الحسابات غير المربوطة */}
          {applied.includeUnmapped && unmappedAccounts.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-card">
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={18} />
                  <h3 className="font-semibold">
                    حسابات غير مربوطة ببند في قائمة المركز المالي
                  </h3>
                </div>
                <p className="mt-1 text-xs text-amber-600">
                  هذه الحسابات لها حركة ولكن لم يتم ربطها ببند في القائمة.
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
                        رصيد أول المدة
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        حركة الفترة
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        رصيد آخر المدة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unmappedAccounts.map((row) => {
                      const nature =
                        SECTIONS.find(
                          (s) => s.key === sectionKeyOf(row.accountType),
                        )?.nature ?? "debit";
                      const v = rowValues(nature, row);
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
                          <td className="px-4 py-3">
                            <Amount value={v.opening} />
                          </td>
                          <td className="px-4 py-3">
                            <Amount value={v.movement} />
                          </td>
                          <td className="px-4 py-3">
                            <Amount value={v.closing} bold />
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
              القائمة جاهزة للاعتماد والتقارير.
            </div>
          )}
        </>
      )}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <FinancialPositionPrintTemplate
            data={data}
            sections={sections}
            summary={{ totalAssets, totalLE, difference, balanced }}
            filters={applied}
            companyName={companyName}
          />
        </div>
      </div>
    </div>
  );
}
