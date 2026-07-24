import React from "react";
import { formatNumber } from "../../utils/formatters";

const COLUMNS = [
  { key: "name", label: "الصنف" },
  { key: "unit", label: "الوحدة" },
  { key: "count", label: "العدد" },
  { key: "unitWeight", label: "وزن الوحدة" },
  { key: "quantity", label: "الكمية" },
  { key: "pricePerKg", label: "سعر الكيلو" },
  { key: "value", label: "القيمة" },
  { key: "notes", label: "ملاحظات" },
];

export default function InvoiceItemsTable({ items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h2 className="px-5 pt-5 text-sm font-semibold text-slate-500">
        الأصناف
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-2.5 text-start font-medium text-slate-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-slate-50 ${idx % 2 === 1 ? "bg-slate-50/40" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {formatNumber(item.count)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {formatNumber(item.unitWeight)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {formatNumber(item.quantity)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {formatNumber(item.pricePerKg)}
                </td>
                <td className="px-4 py-3 tabular-nums font-semibold text-slate-800">
                  {formatNumber(item.value)}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {item.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-2" />
    </div>
  );
}
