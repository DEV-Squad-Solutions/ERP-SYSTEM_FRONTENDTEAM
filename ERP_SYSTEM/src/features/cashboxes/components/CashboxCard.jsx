import { Pencil, Trash2 } from "lucide-react";

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return Number(value).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CashboxCard({ cashbox, onClick, onEdit, onDelete }) {
  const isForeignCurrency = cashbox.currency !== cashbox.baseCurrency;

  return (
    <div className="group bg-white border border-ink-400/10 rounded-2xl p-4 hover:border-emerald-700/30 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button onClick={onClick} className="min-w-0 text-right flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-ink-900 truncate">
              {cashbox.name || "بدون اسم"}
            </h3>

            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                cashbox.isActive
                  ? "text-emerald-700 bg-emerald-700/10"
                  : "text-red-500 bg-red-500/10"
              }`}
            >
              {cashbox.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>

          <span className="font-mono text-[11px] text-ink-400">
            {cashbox.code || "—"}
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(cashbox);
            }}
            className="p-1.5 rounded-lg text-ink-400 hover:text-emerald-700 hover:bg-emerald-700/5 transition-colors"
            title="تعديل"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(cashbox);
            }}
            className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-500/5 transition-colors"
            title="حذف"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Current Balance */}
      <button onClick={onClick} className="w-full text-right mt-4">
        <div className="rounded-xl bg-emerald-700/[0.06] px-4 py-3">
          <p className="text-[11px] text-ink-400 mb-1">الرصيد الحالي</p>

          <div className="flex items-end justify-between gap-2">
            <p className="text-xl font-bold text-emerald-700 leading-none">
              {formatNumber(cashbox.currentBalance)}
            </p>

            <span className="text-xs font-semibold text-ink-500">
              {cashbox.currency}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-ink-400/10 mt-3">
          <div className="px-2 first:pr-0">
            <p className="text-[10px] text-ink-400 mb-1">الافتتاحي</p>

            <p className="text-sm font-semibold text-ink-800 truncate">
              {formatNumber(cashbox.openingBalance)}
            </p>
          </div>

          <div className="px-3">
            <p className="text-[10px] text-ink-400 mb-1">تاريخ الافتتاح</p>

            <p className="text-sm font-semibold text-ink-800 truncate">
              {formatDate(cashbox.openingBalanceDate)}
            </p>
          </div>

          <div className="px-3 last:pl-0">
            <p className="text-[10px] text-ink-400 mb-1">العملة</p>

            <p className="text-sm font-semibold text-ink-800">
              {cashbox.currency || "—"}
            </p>
          </div>
        </div>

        {/* Exchange Rate */}
        {isForeignCurrency && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-400/10 text-xs">
            <span className="text-ink-400">سعر الصرف الافتتاحي</span>

            <span className="font-semibold text-ink-700">
              {formatNumber(cashbox.openingExchangeRate)}
            </span>
          </div>
        )}

        {/* Notes */}
        {cashbox.notes && (
          <div className="mt-3 pt-3 border-t border-ink-400/10">
            <p className="text-xs text-ink-500 truncate">
              <span className="text-ink-400">ملاحظة:</span> {cashbox.notes}
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
