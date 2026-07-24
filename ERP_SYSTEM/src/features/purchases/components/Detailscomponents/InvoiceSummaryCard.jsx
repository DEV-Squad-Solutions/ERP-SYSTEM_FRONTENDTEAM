import React, { useMemo } from "react";
import { calculateInvoiceTotals, formatNumber } from "../../utils/formatters";

export default function InvoiceSummaryCard({ items }) {
  const totals = useMemo(() => calculateInvoiceTotals(items), [items]);

  const rows = [
    { label: "عدد الأصناف", value: totals.itemsCount },
    { label: "إجمالي العدد", value: totals.totalCount },
    { label: "إجمالي الكمية", value: totals.totalQuantity },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-500">
        ملخص الفاتورة
      </h2>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{row.label}</span>
            <span className="tabular-nums text-sm font-medium text-slate-800">
              {formatNumber(row.value)}
            </span>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-[#0F6E5E]/5 px-3 py-2.5">
          <span className="text-sm font-semibold text-[#0F6E5E]">
            إجمالي القيمة
          </span>
          <span className="tabular-nums text-base font-bold text-[#0F6E5E]">
            {formatNumber(totals.totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
