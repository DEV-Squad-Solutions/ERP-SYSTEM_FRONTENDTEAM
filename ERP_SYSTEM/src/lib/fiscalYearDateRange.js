/**
 * أدوات مشتركة للتحقق من إن تاريخ حركة (فاتورة، سند، إلخ) واقع
 * داخل حدود السنة المالية المختارة، قبل الإرسال للـ backend —
 * تفاديًا لخطأ `FiscalYears.QueryDateOutsideRange` بعد الإرسال.
 */

/**
 * @param {string|Date} date
 * @param {{ startDate: string, endDate: string } | null | undefined} fiscalYear
 * @returns {boolean} true لو مفيش سنة مختارة (مفيش قيد) أو التاريخ داخل حدودها
 */
export function isDateWithinFiscalYear(date, fiscalYear) {
  if (!date || !fiscalYear?.startDate || !fiscalYear?.endDate) return true;

  const value = new Date(date).setHours(0, 0, 0, 0);
  const start = new Date(fiscalYear.startDate).setHours(0, 0, 0, 0);
  const end = new Date(fiscalYear.endDate).setHours(0, 0, 0, 0);

  return value >= start && value <= end;
}

/**
 * بيرجع رسالة تحذير جاهزة للعرض لو التاريخ برّه حدود السنة، أو
 * null لو التاريخ سليم (أو مفيش سنة للمقارنة بيها أصلًا).
 *
 * @param {string|Date} date
 * @param {{ name: string, startDate: string, endDate: string } | null | undefined} fiscalYear
 */
export function getFiscalYearDateWarning(date, fiscalYear) {
  if (isDateWithinFiscalYear(date, fiscalYear)) return null;

  return `التاريخ المحدد خارج حدود السنة المالية "${fiscalYear.name}" (${fiscalYear.startDate} — ${fiscalYear.endDate}).`;
}

/* =========================================================
   ضبط فلاتر التاريخ داخل حدود السنة المالية
========================================================= */

/** yyyy-MM-dd فقط (بيتجاهل أي جزء وقت). */
export const toDay = (value) => String(value || "").slice(0, 10);

/**
 * لو التاريخ برّه حدود السنة يرجّع `fallback` (افتراضيًا فاضي =
 * "السنة كلها")، وإلا يرجّع القيمة كما هي.
 */
export function clampDateToFiscalYear(value, fiscalYear, fallback = "") {
  if (!value || !fiscalYear?.startDate || !fiscalYear?.endDate) return value;

  const day = toDay(value);

  if (day >= toDay(fiscalYear.startDate) && day <= toDay(fiscalYear.endDate)) {
    return value;
  }

  return fallback;
}

/**
 * يطبّق clampDateToFiscalYear على مفاتيح تواريخ داخل object فلاتر.
 * بيرجّع نفس الـ object لو مفيش تغيير (عشان مفيش re-render زيادة).
 */
export function clampFilterDates(filters, keys, fiscalYear, fallbacks = {}) {
  let changed = false;
  const next = { ...filters };

  keys.forEach((key) => {
    const out = clampDateToFiscalYear(next[key], fiscalYear, fallbacks[key] ?? "");

    if (out !== next[key]) {
      next[key] = out;
      changed = true;
    }
  });

  return changed ? next : filters;
}

/**
 * فترة افتراضية للتقارير/الـ Dashboard: لو النهارده جوه السنة → من
 * أول الشهر لحد النهارده، وإلا (سنة تاريخية) → السنة كلها.
 */
export function getDefaultRangeForFiscalYear(fiscalYear) {
  const today = new Date().toLocaleDateString("en-CA");
  const start = toDay(fiscalYear.startDate);
  const end = toDay(fiscalYear.endDate);

  if (today >= start && today <= end) {
    return { start: `${today.slice(0, 8)}01`, end: today };
  }

  return { start, end };
}

/**
 * لو أي طرف من الفترة (from/to) برّه حدود السنة، يرجّع الفترة كلها
 * للافتراضية (الشهر الحالي لو السنة حالية، وإلا السنة كلها). لو
 * الفترة سليمة يرجّع نفس الـ object (من غير re-render زيادة).
 */
export function resetRangeIfOutside(filters, fromKey, toKey, fiscalYear) {
  const outside = [filters[fromKey], filters[toKey]].some(
    (value) => clampDateToFiscalYear(value, fiscalYear, "x") !== value,
  );

  if (!outside) return filters;

  const range = getDefaultRangeForFiscalYear(fiscalYear);

  return { ...filters, [fromKey]: range.start, [toKey]: range.end };
}
