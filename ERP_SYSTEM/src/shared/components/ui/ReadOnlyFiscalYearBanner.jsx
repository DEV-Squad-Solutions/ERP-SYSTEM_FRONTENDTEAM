import { Lock } from "lucide-react";

/**
 * تنبيه موحّد يُعرض أعلى شاشات الحركات لما السنة المالية المختارة
 * تكون مغلقة (status = "Closed") — الشاشة بتبقى للعرض فقط.
 */
export default function ReadOnlyFiscalYearBanner({ fiscalYear }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
      <Lock size={16} strokeWidth={2} className="shrink-0" />
      <span>
        السنة المالية "{fiscalYear?.name}"{" "}
        {fiscalYear?.status === "Closed" ? "مغلقة" : "ليست السنة الحالية"} —
        هذه الشاشة للعرض فقط، ولا يمكن إضافة أو تعديل أو حذف أي حركة عليها.
      </span>
    </div>
  );
}
