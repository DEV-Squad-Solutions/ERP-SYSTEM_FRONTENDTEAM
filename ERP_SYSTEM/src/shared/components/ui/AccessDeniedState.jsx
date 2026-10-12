import { ShieldAlert } from "lucide-react";

/**
 * حالة "ممنوع الوصول" (HTTP 403).
 *
 * الباك إند بيرجّع 403 لبعض التقارير المالية لما المستخدم ما عندهوش
 * وصول لكل خزائن الشركة. في الحالة دي مش المفروض نعرض تقرير جزئي
 * (أرقام ناقصة أو أصفار مضللة) — نعرض رسالة واضحة بدل كده.
 *
 * @param {{
 *   title?: string,
 *   message?: string,
 *   onRetry?: () => void,
 * }} props
 */
export default function AccessDeniedState({
  title = "غير مصرح بعرض التقرير",
  message = "مش عندك صلاحية الوصول لكل البيانات المطلوبة لعرض التقرير ده. التقرير مش بيتم عرضه بشكل جزئي — تواصل مع مسؤول النظام لو محتاج الصلاحية.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
      <ShieldAlert
        size={34}
        className="text-amber-500"
        strokeWidth={1.6}
      />

      <div>
        <p className="font-semibold text-amber-800">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-amber-700">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-amber-300 bg-white px-4 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
