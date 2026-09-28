import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { selectSelectedFiscalYear } from "../features/fiscalYears/fiscalYearSlice";

/**
 * بينفّذ callback(fiscalYear) أول ما السنة المالية المختارة تتحمّل
 * وكل مرة id بتاعها يتغيّر. الاستخدام: تصفير الـ pagination وضبط
 * فلاتر التاريخ داخل حدود السنة الجديدة (حسب دليل الفرونت إند).
 */
export function useOnFiscalYearChange(callback) {
  const fiscalYear = useSelector(selectSelectedFiscalYear);
  const yearId = fiscalYear?.id;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (yearId) callbackRef.current(fiscalYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearId]);
}
