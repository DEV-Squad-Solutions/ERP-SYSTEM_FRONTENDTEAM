/**
 * أدوات التاريخ الموحّدة للنظام كله.
 *
 * القاعدة: العرض دائمًا **يوم/شهر/سنة** بأرقام إنجليزية (13/10/2026)،
 * أما القيمة المخزّنة/المُرسَلة للـ API فتبقى بصيغة ISO (YYYY-MM-DD).
 */

const pad2 = (n) => String(n).padStart(2, "0");

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

/**
 * توحيد أي قيمة تاريخ إلى YYYY-MM-DD.
 * بتقبل Date أو نص ISO (2026-10-13 أو 2026-10-13T10:00:00Z).
 * بترجّع "" لو القيمة فاضية أو غير صالحة.
 */
export function toISODate(value) {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
      value.getDate(),
    )}`;
  }

  const text = String(value);

  // نص ISO بالفعل (أخذ جزء التاريخ فقط، مع تجاهل المنطقة الزمنية)
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";

  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(
    parsed.getDate(),
  )}`;
}

/**
 * عرض التاريخ بصيغة يوم/شهر/سنة بأرقام إنجليزية: 13/10/2026.
 */
export function formatDate(value) {
  // لو القيمة أصلًا بصيغة يوم/شهر/سنة نرجّعها زي ما هي (يمنع التنسيق المزدوج)
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    return value.trim();
  }

  const iso = toISODate(value);
  if (!iso) return "";

  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * عرض التاريخ والوقت: 13/10/2026 14:30.
 */
export function formatDateTime(value) {
  if (value === null || value === undefined || value === "") return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);

  return `${formatDate(date)} ${pad2(date.getHours())}:${pad2(
    date.getMinutes(),
  )}`;
}

/**
 * تحويل نص يوم/شهر/سنة (13/10/2026) إلى YYYY-MM-DD.
 * بترجّع "" لو النص غير مكتمل أو يمثّل تاريخًا غير صالح.
 */
export function parseDisplayDate(text) {
  const match = String(text || "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return "";

  const [, day, month, year] = match;
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  const date = new Date(yearNum, monthNum - 1, dayNum);

  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() + 1 !== monthNum ||
    date.getDate() !== dayNum
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}
