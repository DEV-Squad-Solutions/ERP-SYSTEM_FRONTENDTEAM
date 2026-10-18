/**
 * بيحول أخطاء الباك إند (RFC 7807 problem details + custom error codes) لرسالة عربية مفهومة.
 * نفس فلسفة getCashVoucherErrorMessage - عدّل الأكواد (Accounts.xxx) لما تتأكد من قيمها
 * الفعلية اللي راجعة من الـ API عندك.
 */
const ERROR_MESSAGES = {
  // الأكواد دي هي الفعلية اللي بيرجعها الباك (AccountErrors.cs)
  "Accounts.DuplicateCode": "كود الحساب ده مستخدم بالفعل داخل الشركة.",
  "Accounts.CodeExists": "كود الحساب ده مستخدم بالفعل داخل الشركة.",
  "Accounts.ParentMustBeNonPosting":
    "لا يمكن اختيار حساب قابل للتسجيل ليكون حسابًا أبًا. اختر حسابًا رئيسيًا غير قابل للتسجيل.",
  "Accounts.ParentMustBeGroup":
    "لا يمكن اختيار حساب قابل للتسجيل ليكون حسابًا أبًا. اختر حسابًا رئيسيًا غير قابل للتسجيل.",
  "Accounts.ParentInactive": "الحساب الأب المختار غير فعال، اختر حسابًا آخر.",
  "Accounts.ParentNotFound": "الحساب الأب المختار غير موجود.",
  "Accounts.HasChildren":
    "لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية. احذف أو انقل الحسابات الفرعية أولًا.",
  "Accounts.HasTransactions":
    "لا يمكن حذف هذا الحساب لأنه مرتبط بحركات مسجلة بالفعل.",
  "Accounts.HasJournalEntries":
    "لا يمكن حذف هذا الحساب لأنه مرتبط بقيود يومية مسجلة بالفعل. يمكنك إلغاء تنشيطه بدلًا من ذلك.",
  "Accounts.HasCashVouchers":
    "لا يمكن حذف هذا الحساب لأنه مرتبط بسندات قبض أو صرف مسجلة بالفعل. يمكنك إلغاء تنشيطه بدلًا من ذلك.",
  "Accounts.HasRevaluations":
    "لا يمكن حذف هذا الحساب لأنه مرتبط بحركات إعادة تقييم عملة. يمكنك إلغاء تنشيطه بدلًا من ذلك.",
  "Accounts.HasOperationalMappings":
    "لا يمكن حذف هذا الحساب لأنه مستخدم في إعدادات الربط المحاسبي. غيّر حساب الربط أولًا أو ألغِ تنشيط الحساب.",
  "Accounts.HasStatementMappings":
    "لا يمكن حذف هذا الحساب لوجود ربط حالي أو تاريخي بالقوائم المالية. يمكنك إلغاء تنشيطه بدلًا من ذلك.",
  "Accounts.NotFound": "الحساب غير موجود أو تم حذفه من قبل.",
};

export function getAccountErrorMessage(
  error,
  fallback = "حدث خطأ غير متوقع أثناء تنفيذ العملية، حاول مرة أخرى.",
) {
  const problem = error?.data;
  if (!problem) return fallback;

  const code = problem.errorCode || problem.code || problem.type;

  // الباك بيرجع 409 لكل أنواع التعارض (حذف محظور، كود مكرر، تعديل تراتب...)
  // مش بس تعارض rowVersion — عشان كده نميّز تعارض التعديل المتزامن من كود الخطأ
  // بدل حالة HTTP، وإلا كانت رسالة "عدّل من مستخدم آخر" بتظهر مكان سبب الرفض الفعلي.
  if (code === "Accounts.Concurrency") {
    return "تم تعديل هذا الحساب من مستخدم آخر في نفس الوقت. من فضلك أعد تحميل الصفحة وحاول مرة أخرى.";
  }

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
