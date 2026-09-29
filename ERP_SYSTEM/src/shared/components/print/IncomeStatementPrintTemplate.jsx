// src/shared/components/print/IncomeStatementPrintTemplate.jsx
import { Fragment } from "react";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(
    n ?? 0,
  );
}

export default function IncomeStatementPrintTemplate({
  data,
  sections = [],
  summary = {},
  filters = {},
  companyName = "",
}) {
  const printedAt = new Date().toLocaleString("ar-EG");
  const isDetailed = filters.viewMode === "Detailed";
  const colCount = isDetailed ? 5 : 4;
  const { revenue = 0, expense = 0, netResult = 0 } = summary;

  return (
    <div className="p-8 text-ink-900" dir="rtl">
      <div className="flex items-center justify-between border-b border-ink-900/20 pb-4 mb-6">
        <div>
          {companyName && <p className="text-sm font-bold">{companyName}</p>}
          <h1 className="text-xl font-bold">قائمة الدخل</h1>
          <p className="text-xs text-ink-400 mt-1">
            تاريخ الطباعة: {printedAt}
          </p>
        </div>
        <div className="text-sm text-ink-400 text-left">
          {data?.fiscalYearName && <p>السنة المالية: {data.fiscalYearName}</p>}
          <p>
            من {filters.fromDate} إلى {filters.toDate}
          </p>
        </div>
      </div>

      <div className="mb-4 text-xs text-ink-400 space-x-3 space-x-reverse">
        <span>طريقة العرض: {isDetailed ? "تفصيلي" : "ملخص"}</span>
        <span>
          | التسويات:{" "}
          {filters.adjustmentView === "BeforeAdjustments"
            ? "قبل التسوية"
            : "بعد التسوية"}
        </span>
        <span>| العملة: {data?.baseCurrency || "EGP"}</span>
      </div>

      <table className="w-full text-right text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-ink-900">
            <th className="py-2 px-2">بند القائمة</th>
            {isDetailed && <th className="py-2 px-2">الحساب</th>}
            <th className="py-2 px-2">مدين الفترة</th>
            <th className="py-2 px-2">دائن الفترة</th>
            <th className="py-2 px-2">الصافي</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <Fragment key={section.key}>
              <tr className="bg-ink-900/5">
                <td colSpan={colCount} className="py-2 px-2 font-bold">
                  {section.title}
                </td>
              </tr>

              {section.rows.map((row, idx) => (
                <tr
                  key={`${section.key}-${row.financialStatementLineId}-${row.accountId ?? idx}`}
                  className="border-b border-ink-900/10"
                >
                  <td className="py-2 px-2 pr-5">
                    <span className="font-semibold">
                      {row.financialStatementLineName || "—"}
                    </span>
                    {row.financialStatementLineCode && (
                      <span className="mr-2 font-mono text-xs text-ink-400">
                        {row.financialStatementLineCode}
                      </span>
                    )}
                  </td>
                  {isDetailed && (
                    <td className="py-2 px-2">
                      {row.accountName || "—"}
                      {row.accountCode && (
                        <span className="mr-2 font-mono text-xs text-ink-400">
                          {row.accountCode}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="py-2 px-2">{fmt(row.periodDebit)}</td>
                  <td className="py-2 px-2">{fmt(row.periodCredit)}</td>
                  <td className="py-2 px-2 font-semibold">{fmt(row.net)}</td>
                </tr>
              ))}

              <tr className="border-b-2 border-ink-900/30 font-bold">
                <td className="py-2 px-2" colSpan={isDetailed ? 2 : 1}>
                  إجمالي {section.title}
                </td>
                <td className="py-2 px-2">{fmt(section.sum.debit)}</td>
                <td className="py-2 px-2">{fmt(section.sum.credit)}</td>
                <td className="py-2 px-2">{fmt(section.sum.net)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>

        {sections.length > 0 && (
          <tfoot>
            <tr className="font-bold">
              <td className="py-2 px-2" colSpan={colCount - 1}>
                إجمالي الإيرادات
              </td>
              <td className="py-2 px-2">{fmt(revenue)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 px-2" colSpan={colCount - 1}>
                إجمالي المصروفات
              </td>
              <td className="py-2 px-2">{fmt(expense)}</td>
            </tr>
            <tr className="font-bold border-t-2 border-ink-900">
              <td className="py-2 px-2" colSpan={colCount - 1}>
                {netResult >= 0 ? "صافي ربح الفترة" : "صافي خسارة الفترة"}
              </td>
              <td className="py-2 px-2">{fmt(netResult)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {sections.length === 0 && (
        <p className="text-center text-ink-400 py-10">لا توجد بيانات للطباعة</p>
      )}
    </div>
  );
}
