/**
 * بيحول أخطاء الباك إند (RFC 7807 problem details + custom error codes) لرسالة عربية مفهومة.
 * نفس فلسفة getCashVoucherErrorMessage - عدّل الأكواد (Accounts.xxx) لما تتأكد من قيمها
 * الفعلية اللي راجعة من الـ API عندك.
 */
const ERROR_MESSAGES = {
  "Accounts.DuplicateCode": "كود الحساب ده مستخدم بالفعل داخل الشركة.",
  "Accounts.ParentMustBeNonPosting":
    "لا يمكن اختيار حساب قابل للتسجيل ليكون حسابًا أبًا. اختر حسابًا رئيسيًا غير قابل للتسجيل.",
  "Accounts.ParentInactive": "الحساب الأب المختار غير فعال، اختر حسابًا آخر.",
  "Accounts.ParentNotFound": "الحساب الأب المختار غير موجود.",
  "Accounts.HasChildren":
    "لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية. احذف أو انقل الحسابات الفرعية أولًا.",
  "Accounts.HasTransactions":
    "لا يمكن حذف هذا الحساب لأنه مرتبط بحركات مسجلة بالفعل.",
  "Accounts.NotFound": "الحساب غير موجود أو تم حذفه من قبل.",
};

export function getAccountErrorMessage(
  error,
  fallback = "حدث خطأ غير متوقع أثناء تنفيذ العملية، حاول مرة أخرى.",
) {
  const problem = error?.data;

  // تعارض تعديل متزامن (rowVersion) - نفس المنطق المستخدم في سندات الخزينة
  if (error?.status === 409 || problem?.status === 409) {
    return "تم تعديل هذا الحساب من مستخدم آخر في نفس الوقت. من فضلك أعد تحميل الصفحة وحاول مرة أخرى.";
  }

  if (!problem) return fallback;

  const code = problem.errorCode || problem.code || problem.type;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];

  // أخطاء تحقق قياسية (ValidationProblemDetails) - errors: { field: [msg, ...] }
  if (problem.errors && typeof problem.errors === "object") {
    const firstField = Object.values(problem.errors)[0];
    if (Array.isArray(firstField) && firstField.length) return firstField[0];
  }

  if (problem.title) return problem.title;
  if (problem.detail) return problem.detail;

  return fallback;
}
