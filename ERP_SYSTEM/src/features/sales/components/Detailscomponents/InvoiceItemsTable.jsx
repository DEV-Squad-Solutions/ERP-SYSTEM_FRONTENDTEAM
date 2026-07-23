import { Package } from "lucide-react";

/**
 * @param {{ items: Array, currency?: string }} props
 */
export default function InvoiceItemsTable({ items, currency }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card text-center py-10">
        <Package
          size={26}
          className="mx-auto text-ink-400/40 mb-2"
          strokeWidth={1.6}
        />
        <p className="text-sm text-ink-400">لا توجد أصناف في هذه الفاتورة</p>
      </div>
    );
  }

  const symbol = currency === "USD" ? "$" : "ج.م";

  return (
    <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
      <table className="w-full text-right border-collapse text-sm min-w-[750px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-3 font-medium">الصنف</th>
            <th className="p-3 font-medium">الوحدة</th>
            <th className="p-3 font-medium">العدد</th>
            <th className="p-3 font-medium">وزن الوحدة</th>
            <th className="p-3 font-medium">الكمية</th>
            <th className="p-3 font-medium">سعر الكيلو</th>
            <th className="p-3 font-medium">القيمة</th>
            <th className="p-3 font-medium">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-t border-ink-400/5 hover:bg-ink-900/[0.01] transition-colors"
            >
              <td className="p-3 font-medium text-ink-900">{item.itemName}</td>
              <td className="p-3 text-ink-600">
                {item.packagingUnitName || "—"}
              </td>
              <td className="p-3 num text-center">
                {item.packagingCount || "—"}
              </td>
              <td className="p-3 num text-ink-600">
                {(item.unitWeight || 0).toLocaleString("ar-EG")}
              </td>
              <td className="p-3 num text-ink-900 font-medium">
                {(item.quantity || 0).toLocaleString("ar-EG")}
              </td>
              <td className="p-3 num text-ink-600">
                {(item.price || 0).toLocaleString("ar-EG")}
              </td>
              <td className="p-3 num font-medium">
                {(item.value || 0).toLocaleString("ar-EG")} {symbol}
              </td>
              <td className="p-3 text-ink-400 text-xs">{item.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
