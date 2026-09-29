// src/shared/components/print/CashFlowPrintTemplate.jsx
import { Fragment } from "react";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(
    n ?? 0,
  );
}

export default function CashFlowPrintTemplate({
  data,
  groups = [],
  summary = {},
  filters = {},
  companyName = "",
}) {
  const printedAt = new Date().toLocaleString("ar-EG");
  const isDetailed = filters.viewMode === "Detailed";
  const colCount = isDetailed ? 4 : 4;
  const { netCashFlow = 0, periodDebit = 0, periodCredit = 0 } = summary;
  const flatRows = groups.flatMap((g) => g.rows);

  return (
    <div className="p-8 text-ink-900" dir="rtl">
      <div className="flex items-center justify-between border-b border-ink-900/20 pb-4 mb-6">
        <div>
          {companyName && <p className="text-sm font-bold">{companyName}</p>}
          <h1 className="text-xl font-bold">قائمة التدفقات النقدية</h1>
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
            <th className="py-2 px-2">
              {isDetailed ? "الحساب" : "بند التدفقات النقدية"}
            </th>
            <th className="py-2 px-2">مدين الفترة</th>
            <th className="py-2 px-2">دائن الفترة</th>
            <th className="py-2 px-2">صافي التدفق</th>
          </tr>
        </thead>
        <tbody>
          {isDetailed
            ? groups.map((g) => (
                <Fragment key={g.key}>
                  <tr className="bg-ink-900/5">
                    <td colSpan={colCount} className="py-2 px-2 font-bold">
                      {g.name}
                      {g.code && (
                        <span className="mr-2 font-mono text-xs text-ink-400">
                          {g.code}
                        </span>
                      )}
                    </td>
                  </tr>
                  {g.rows.map((row, idx) => (
                    <tr
                      key={`${g.key}-${row.accountId ?? idx}`}
                      className="border-b border-ink-900/10"
                    >
                      <td className="py-2 px-2 pr-5">
                        {row.accountName || "—"}
                        {row.accountCode && (
                          <span className="mr-2 font-mono text-xs text-ink-400">
                            {row.accountCode}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2">{fmt(row.periodDebit)}</td>
                      <td className="py-2 px-2">{fmt(row.periodCredit)}</td>
                      <td className="py-2 px-2 font-semibold">
                        {fmt(row.net)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-ink-900/30 font-bold">
                    <td className="py-2 px-2">إجمالي {g.name}</td>
                    <td className="py-2 px-2">{fmt(g.sum.debit)}</td>
                    <td className="py-2 px-2">{fmt(g.sum.credit)}</td>
                    <td className="py-2 px-2">{fmt(g.sum.net)}</td>
                  </tr>
                </Fragment>
              ))
            : flatRows.map((row, idx) => (
                <tr
                  key={`${row.financialStatementLineId}-${idx}`}
                  className="border-b border-ink-900/10"
                >
                  <td className="py-2 px-2">
                    <span className="font-semibold">
                      {row.financialStatementLineName || "—"}
                    </span>
                    {row.financialStatementLineCode && (
                      <span className="mr-2 font-mono text-xs text-ink-400">
                        {row.financialStatementLineCode}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2">{fmt(row.periodDebit)}</td>
                  <td className="py-2 px-2">{fmt(row.periodCredit)}</td>
                  <td className="py-2 px-2 font-semibold">{fmt(row.net)}</td>
                </tr>
              ))}
        </tbody>

        {flatRows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-ink-900 font-bold">
              <td className="py-2 px-2">الإجمالي</td>
              <td className="py-2 px-2">{fmt(periodDebit)}</td>
              <td className="py-2 px-2">{fmt(periodCredit)}</td>
              <td className="py-2 px-2">{fmt(netCashFlow)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {flatRows.length === 0 && (
        <p className="text-center text-ink-400 py-10">لا توجد بيانات للطباعة</p>
      )}
    </div>
  );
}
