import { useSelector } from "react-redux";

import {
  selectSelectedFiscalYear,
  selectSelectedFiscalYearId,
} from "../features/fiscalYears/fiscalYearSlice";

/**
 * Hook مشترك لأي شاشة/فورم عايز يعرف:
 * - إيه السنة المالية المختارة حاليًا (الاسم، حدودها، حالتها).
 * - هل السنة دي مغلقة، وبالتالي الشاشة لازم تبقى Read-only.
 *
 * الاستخدام المتوقع في صفحات الحركات (سندات، فواتير، جرد...):
 *
 *   const { isReadOnly, fiscalYear } = useFiscalYearGuard();
 *   <button disabled={isReadOnly}>إضافة</button>
 *   {isReadOnly && <ReadOnlyFiscalYearBanner fiscalYear={fiscalYear} />}
 */
export function useFiscalYearGuard() {
  const fiscalYear = useSelector(selectSelectedFiscalYear);
  const fiscalYearId = useSelector(selectSelectedFiscalYearId);

  const isClosed = fiscalYear?.status === "Closed";

  // الكتابة مسموحة فقط في السنة الحالية المفتوحة (الباك إند بيتحقق
  // من ده برضه). لو السنة لسه بتتحمّل منقفلش الشاشة.
  const canWrite =
    !fiscalYear || (fiscalYear.isCurrent && fiscalYear.status === "Open");

  return {
    fiscalYearId,
    fiscalYear,
    isClosed,
    canWrite,
    isReadOnly: !canWrite,
  };
}
