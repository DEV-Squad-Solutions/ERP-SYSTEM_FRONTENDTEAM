import { X, History } from "lucide-react";

/**
 * @param {{ open: boolean, onClose: () => void, invoiceId: string }} props
 */
export default function AuditLogDrawer({ open, onClose, invoiceId }) {
  if (!open) return null;

  // بيانات وهمية مؤقتًا لحد ما endpoint سجل العمليات يتحدد
  const logs = [
    {
      id: 1,
      action: "تم إنشاء الفاتورة",
      user: "أحمد المدير",
      date: "2026-06-01 10:24",
    },
    {
      id: 2,
      action: "تم تعديل بيانات الدفع",
      user: "محمد المحاسب",
      date: "2026-06-02 14:10",
    },
  ];

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 z-40 animate-fadeUp"
      />
      <div className="fixed top-0 left-0 h-screen w-full sm:w-96 bg-paper z-50 shadow-card overflow-y-auto custom-scroll animate-slideInRight">
        <div className="sticky top-0 bg-ink-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} />
            <h3 className="font-display font-bold">سجل العمليات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-ink-400/10 bg-white p-3"
            >
              <p className="text-sm text-ink-900 font-medium">{log.action}</p>
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>{log.user}</span>
                <span className="num">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
