/**
 * فحص احترازي (حسب دليل الفرونت إند): الاستجابة اللي بترجع بـ
 * `fiscalYearId` لازم تطابق السنة اللي الطلب اتبعت بيها، وإلا
 * البيانات دي تخص سنة تانية (مثلًا طلب قديم اتأخر بعد تغيير السنة،
 * أو endpoint تجاهل الفلتر) ومينفعش تتعرض.
 */

const MAX_ITEMS_TO_CHECK = 500;

/**
 * السنة اللي الطلب اتبعت بيها فعليًا (من الـ params)، أو null لو
 * الطلب مش GET أو مفيهوش سنة صالحة.
 */
export function getSentFiscalYearId(args) {
  if (typeof args !== "object" || args === null) return null;

  const method = (args.method || "GET").toUpperCase();
  if (method !== "GET" || !args.params) return null;

  const key = Object.keys(args.params).find(
    (name) => name.toLowerCase() === "fiscalyearid",
  );
  const id = key ? Number(args.params[key]) : NaN;

  return Number.isFinite(id) && id > 0 ? id : null;
}

const differs = (value, expectedId) =>
  value !== undefined && value !== null && Number(value) !== expectedId;

/**
 * بيرجّع أول fiscalYearId مخالف لاتضاف في الاستجابة (على مستوى الـ
 * object نفسه أو عناصر items / المصفوفة)، أو null لو كله مطابق أو
 * الاستجابة مفيهاش fiscalYearId أصلًا.
 */
export function findFiscalYearMismatch(data, expectedId) {
  if (!data || typeof data !== "object") return null;

  if (!Array.isArray(data) && differs(data.fiscalYearId, expectedId)) {
    return data.fiscalYearId;
  }

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : [];

  for (const row of rows.slice(0, MAX_ITEMS_TO_CHECK)) {
    if (row && typeof row === "object" && differs(row.fiscalYearId, expectedId)) {
      return row.fiscalYearId;
    }
  }

  return null;
}
