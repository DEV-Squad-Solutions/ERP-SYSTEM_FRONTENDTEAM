// src/shared/components/print/FinancialPositionPrintTemplate.jsx
import { Fragment } from "react";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(
    n ?? 0,
  );
}

export default function FinancialPositionPrintTemplate({
  data,
  sections = [],
  summary = {},
  filters = {},
  companyName = "",
}) {
  const printedAt = new Date().toLocaleString("ar-EG");
  const isDetailed = filters.viewMode === "Detailed";
  const { totalAssets, totalLE, difference, balanced } = summary;

  return (
    <div className="p-8 text-ink-900" dir="rtl">
      <div className="flex items-center justify-between border-b border-ink-900/20 pb-4 mb-6">
        <div>
          {companyName && <p className="text-sm font-bold">{companyName}</p>}
          <h1 className="text-xl font-bold">قائمة المركز المالي</h1>
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
        <span>
          طريقة العرض: {filters.viewMode === "Detailed" ? "تفصيلي" : "ملخص"}
        </span>
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
            <th className="py-2 px-2">{isDetailed ? "الحساب" : "البند"}</th>
            <th className="py-2 px-2">رصيد أول المدة</th>
            <th className="py-2 px-2">حركة الفترة</th>
            <th className="py-2 px-2">رصيد آخر المدة</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <Fragment key={section.key}>
              <tr className="bg-ink-900/5">
                <td colSpan={4} className="py-2 px-2 font-bold">
                  {section.title}
                </td>
              </tr>

              {section.rows.map((row, idx) => {
                const v = row.v;
                return (
                  <tr
                    key={`${section.key}-${row.financialStatementLineId}-${row.accountId ?? idx}`}
                    className="border-b border-ink-900/10"
                  >
                    <td className="py-2 px-2 pr-5">
                      {isDetailed ? (
                        <>
                          <span className="font-semibold">
                            {row.accountName || "—"}
                          </span>
                          {row.accountCode && (
                            <span className="mr-2 font-mono text-xs text-ink-400">
                              {row.accountCode}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">
                            {row.financialStatementLineName || "—"}
                          </span>
                          {row.financialStatementLineCode && (
                            <span className="mr-2 font-mono text-xs text-ink-400">
                              {row.financialStatementLineCode}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="py-2 px-2">{fmt(v.opening)}</td>
                    <td className="py-2 px-2">{fmt(v.movement)}</td>
                    <td className="py-2 px-2 font-semibold">
                      {fmt(v.closing)}
                    </td>
                  </tr>
                );
              })}

              <tr className="border-b-2 border-ink-900/30 font-bold">
                <td className="py-2 px-2">إجمالي {section.title}</td>
                <td className="py-2 px-2">{fmt(section.sum.opening)}</td>
                <td className="py-2 px-2">{fmt(section.sum.movement)}</td>
                <td className="py-2 px-2">{fmt(section.sum.closing)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>

        {sections.length > 0 && (
          <tfoot>
            <tr className="font-bold">
              <td className="py-2 px-2" colSpan={3}>
                إجمالي الأصول
              </td>
              <td className="py-2 px-2">{fmt(totalAssets)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 px-2" colSpan={3}>
                إجمالي الالتزامات وحقوق الملكية
              </td>
              <td className="py-2 px-2">{fmt(totalLE)}</td>
            </tr>
            <tr className="font-bold border-t-2 border-ink-900">
              <td className="py-2 px-2" colSpan={3}>
                {balanced ? "الميزانية متوازنة" : "الفرق بين الطرفين"}
              </td>
              <td className="py-2 px-2">{balanced ? "✓" : fmt(difference)}</td>
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
