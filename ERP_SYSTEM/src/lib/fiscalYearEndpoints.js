/**
 * القائمة الموحّدة لـ endpoints القراءة اللي بتقبل `fiscalYearId` (اختياريًا
 * أو إجباريًا) حسب "دليل تكامل الفرونت إند مع الشركات والسنوات المالية".
 *
 * أي GET مطابق للقائمة دي، ومحصلوش تحديد `fiscalYearId` بشكل صريح في
 * الـ params بتاعته، هيتضاف له تلقائيًا من `baseQueryWithReauth`
 * (شوف: withFiscalYearId).
 */

// استثناءات صريحة: endpoints مذكورة إنها "لا تستقبل fiscalYearId حاليًا"،
// أو مسارات فرعية من مجموعة أوسع (زي Invoices/item-balance تحت Invoices).
const EXCLUDED_PATTERNS = [
  /^dashboard\/?$/i,
  /^invoices\/item-balance/i,
  /^statements\/profitability\/invoices\/[^/]+$/i,
];

const INCLUDED_PATTERNS = [
  // الخزائن والسندات
  /^cashboxrevaluations/i,
  /^cashboxtransfers/i,
  /^cashvouchers/i,

  // رحلات السائقين
  /^drivertrips\/cost-entry/i,

  // الموظفون والرواتب (معزولة حسب السنة المالية)
  /^payrollentries/i,
  /^employeeattendances/i,
  /^employeemovements/i,
  /^employeeopeningbalances/i,

  // أسعار العملات
  /^exchangerates/i,

  // المخزون
  /^inventorycounts/i,
  /^inventoryreports/i,
  /^stockopeningbalances/i,
  /^stockadjustments/i,
  /^stocktransfers/i,

  // الفواتير والتكلفة (باستثناء item-balance المستبعد أعلاه)
  /^invoices($|\/)/i,
  /^invoiceitempricing/i,

  // القيود (GET فقط — الـ POST/PUT بيرسل fiscalYearId في الـ body)
  /^journalentries/i,

  // إعادة تقييم الحسابات النقدية
  /^monetaryaccountrevaluations/i,

  // الأرصدة الافتتاحية للشركاء
  /^partneropeningbalances/i,

  // التقارير وكشوف الحساب (الاستثناءات الفرعية مغطاة في EXCLUDED_PATTERNS)
  /^statements\//i,

  // بنود القوائم المالية وتشكيلها
  /^financialstatementlines/i,

  // جاهزية الإقفال المحاسبي، والربط المحاسبي
  /^accountingreadiness/i,
  /^accountmappings/i,
  /^accountstatementmappings/i,

  // حسابات القيد
  /^accounts\/journal-select/i,

  // Alias كشف حساب الموظف تحت الـ dashboard
  /^dashboard\/payroll\/employees\/statement/i,
];

/**
 * @param {string} url - الـ URL النسبي المرسل لـ endpoint (بدون الـ base URL).
 * @returns {boolean}
 */
export function shouldAttachFiscalYearId(url = "") {
  const path = String(url).replace(/^\/+/, "").split("?")[0];

  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(path))) {
    return false;
  }

  return INCLUDED_PATTERNS.some((pattern) => pattern.test(path));
}
