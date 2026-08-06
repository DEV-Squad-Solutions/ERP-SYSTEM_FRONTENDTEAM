import { Pencil, Trash2, ArrowRight, Warehouse, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StoreHeader({ store, onPrint }) {
  const navigate = useNavigate();

  const isActive = store?.isActive ?? store?.status === "Active";

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 mb-6" dir="rtl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center shrink-0">
            <Warehouse className="w-7 h-7 text-ink-600" />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl font-bold text-ink-900">
                {store?.name || "—"}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {isActive ? "نشط" : "غير نشط"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-sm text-ink-500">
              <span className="font-mono">{store?.code || "—"}</span>
              {store?.address && (
                <>
                  <span className="w-1 h-1 rounded-full bg-ink-300" />
                  <span>{store.address}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Left side: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}
