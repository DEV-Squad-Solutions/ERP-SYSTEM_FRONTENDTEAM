// features/sales/components/Detailscomponents/InvoiceContainerLinesTable.jsx
import { Boxes } from "lucide-react";

/**
 * @param {{ containerLines: Array }} props
 */
export default function InvoiceContainerLinesTable({ containerLines }) {
  if (!containerLines || containerLines.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card text-center py-10">
        <Boxes
          size={26}
          className="mx-auto text-ink-400/40 mb-2"
          strokeWidth={1.6}
        />
        <p className="text-sm text-ink-400">لا توجد عبوات في هذه الفاتورة</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-ink-400/10">
        <Boxes size={18} className="text-gold-600" />
        <h3 className="font-display text-base font-semibold text-ink-900">
          حركة العبوات
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-right border-collapse text-sm min-w-[500px]">
          <thead>
            <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
              <th className="p-3 font-medium">الكود</th>
              <th className="p-3 font-medium">العبوة</th>
              <th className="p-3 font-medium">صادر</th>
              <th className="p-3 font-medium">وارد</th>
            </tr>
          </thead>

          <tbody>
            {containerLines.map((line) => (
              <tr
                key={line.id}
                className="border-t border-ink-400/5 hover:bg-ink-900/[0.01] transition-colors"
              >
                <td className="p-3 num text-ink-400 text-xs">
                  {line.containerCode}
                </td>

                <td className="p-3 font-medium text-ink-900">
                  {line.containerName}
                </td>

                <td className="p-3 num text-negative">
                  {(line.outgoingUnits || 0).toLocaleString("ar-EG")}
                </td>

                <td className="p-3 num text-positive">
                  {(line.incomingUnits || 0).toLocaleString("ar-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
