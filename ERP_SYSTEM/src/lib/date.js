/**
 * تاريخ اليوم بصيغة YYYY-MM-DD بتوقيت القاهرة (Africa/Cairo).
 *
 * بنستخدمها كقيمة افتراضية لتواريخ الحركات (سندات النقدية، التحويلات،
 * القيود...) عشان اليوم ميتقدّمش/يتأخرش حسب توقيت UTC — لأن مصر
 * متقدمة عن UTC، فـ toISOString() بترجّع تاريخ أمس بين 00:00 و02:00
 * بتوقيت القاهرة.
 */
export function todayInCairo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
