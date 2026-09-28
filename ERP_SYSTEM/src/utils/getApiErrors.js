// رسائل مخصصة لأكواد أخطاء (errorCode) الدليل طلب توضيحها للمستخدم صراحةً
const ERROR_CODE_MESSAGES = {
  "PayrollEntry.ClosedFiscalYearPaymentRequiresSettlement":
    "لا يمكن تحويل أو تعديل مسير تابع لسنة مالية مغلقة، لأن بيانات السنوات التاريخية لا تُعدَّل بعد إقفالها. المطلوب عمل تسوية في السنة الحالية.",
  "EmployeeOpeningBalances.CarriedForwardReadOnly":
    "هذا الرصيد مرحّل من السنة السابقة ولا يمكن تعديله أو حذفه من هنا. لتصحيحه: عدّل القيد المصدر بعد إعادة فتح السنة السابقة، أو أنشئ قيد تسوية في السنة الحالية.",
  "FiscalYears.CurrentNotFound":
    "الشركة لا تحتوي على سنة مالية حالية. اضبط سنة حالية من شاشة السنوات المالية.",
};

export const getApiErrors = (error) => {
  // أخطاء بدون Response من السيرفر
  if (!error?.data) {
    switch (error?.status) {
      case "FETCH_ERROR":
        return ["تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت."];

      case "TIMEOUT_ERROR":
        return ["انتهت مهلة الاتصال بالخادم."];

      case "PARSING_ERROR":
        return ["تعذر قراءة استجابة الخادم."];

      default:
        return ["حدث خطأ غير متوقع."];
    }
  }

  const data = error.data;

  // رسالة مخصصة حسب errorCode (لو معرّفة)
  if (data.errorCode && ERROR_CODE_MESSAGES[data.errorCode]) {
    return [ERROR_CODE_MESSAGES[data.errorCode]];
  }

  // Validation Errors
  if (data.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().filter(Boolean);
  }

  // Problem Details (RFC 9110)
  if (data.detail) {
    return [data.detail];
  }

  if (data.message) {
    return [data.message];
  }

  if (data.title) {
    return [data.title];
  }

  return ["حدث خطأ غير متوقع."];
};
