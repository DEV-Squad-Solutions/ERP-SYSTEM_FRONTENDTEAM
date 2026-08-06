import { Pencil, Trash2 } from "lucide-react";

export default function CashboxCard({ cashbox, onClick, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-ink-400/10 rounded-2xl p-5 hover:border-emerald-700/40 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-ink-400">{cashbox.code}</span>

        <div className="flex items-center gap-2">
          <span
            className={
              cashbox.isActive
                ? "text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                : "text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
            }
          >
            {cashbox.isActive ? "نشط" : "غير نشط"}
          </span>

          <div className="flex items-center gap-1 border-r border-ink-400/10 pr-2 mr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(cashbox);
              }}
              className="text-ink-400 hover:text-emerald-700 p-1"
              title="تعديل"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(cashbox);
              }}
              className="text-ink-400 hover:text-red-600 p-1"
              title="حذف"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={onClick} className="text-right w-full block">
        <h3 className="font-display font-bold text-ink-900 text-lg">
          {cashbox.name}
        </h3>
        <p className="text-sm text-ink-400 mt-1">
          {cashbox.balance != null
            ? cashbox.balance.toLocaleString("ar-EG")
            : "—"}{" "}
          {cashbox.currency}
        </p>
      </button>
    </div>
  );
}
