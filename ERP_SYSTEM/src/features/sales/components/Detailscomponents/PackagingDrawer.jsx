import { X, Boxes, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

/**
 * @param {{ containerLines: Array, storeName?: string, invoiceNumber?: string, isOpen: boolean, onClose: () => void }} props
 */
export default function PackagingDrawer({
  containerLines,
  storeName,
  invoiceNumber,
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  const rows = (containerLines || []).map((c) => ({
    id: c.id,
    name: c.containerName,
    code: c.containerCode,
    out: c.outgoingUnits || 0,
    in: c.incomingUnits || 0,
    balance: (c.outgoingUnits || 0) - (c.incomingUnits || 0),
  }));

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 z-40 animate-fadeUp"
      />
      <div className="fixed top-0 left-0 h-screen w-full sm:w-96 bg-paper z-50 shadow-card overflow-y-auto custom-scroll animate-slideInRight">
        <div className="sticky top-0 bg-primary-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes size={18} />
            <h3 className="font-display font-bold">مخزن العبوات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm space-y-1">
            {storeName && (
              <p className="text-ink-600">
                المخزن:{" "}
                <span className="text-ink-900 font-medium">{storeName}</span>
              </p>
            )}
            {invoiceNumber && (
              <p className="text-ink-600">
                رقم الفاتورة:{" "}
                <span className="num text-ink-900 font-medium">
                  {invoiceNumber}
                </span>
              </p>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-10">
              <Boxes
                size={28}
                className="mx-auto text-ink-400/40 mb-2"
                strokeWidth={1.6}
              />
              <p className="text-sm text-ink-400">
                لا توجد عبوات مسجلة في هذه الفاتورة
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-400/10">
              <table className="w-full text-sm text-right border-collapse">
                <thead>
                  <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                    <th className="p-2.5 font-medium">العبوة</th>
                    <th className="p-2.5 font-medium text-negative">
                      <span className="flex items-center gap-1">
                        <ArrowUpCircle size={12} />
                        له (صادر)
                      </span>
                    </th>
                    <th className="p-2.5 font-medium text-positive">
                      <span className="flex items-center gap-1">
                        <ArrowDownCircle size={12} />
                        عليه (وارد)
                      </span>
                    </th>
                    <th className="p-2.5 font-medium">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-ink-400/5">
                      <td className="p-2.5 font-medium text-ink-900">
                        {row.name}
                        <span className="block text-xs text-ink-400 num">
                          {row.code}
                        </span>
                      </td>
                      <td className="p-2.5 num text-negative">{row.out}</td>
                      <td className="p-2.5 num text-positive">{row.in}</td>
                      <td className="p-2.5 num font-bold text-gold-600">
                        {row.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
