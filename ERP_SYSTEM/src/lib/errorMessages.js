// src/lib/errorMessages.js

// الكود بتاع الباك اند -> رسالة بالعربي
export const errorMessagesMap = {
  "Authentication.InvalidCredentials":
    "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "Authentication.UserNotFound": "لا يوجد حساب بهذا البريد الإلكتروني",
  "Authentication.UserInactive": "هذا الحساب غير مفعّل، تواصل مع الإدارة",
  "Authentication.UserLocked":
    "تم قفل الحساب مؤقتًا بسبب محاولات دخول خاطئة متكررة",
  "Company.NotFound": "لم يتم العثور على الشركة المطلوبة",
  "Company.SelectionTokenInvalid":
    "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
  "Validation.Failed": "البيانات المدخلة غير صحيحة",
};

// رسالة افتراضية حسب الـ status code لو الكود مش موجود في الـ map
export const statusFallbackMessages = {
  400: "الطلب غير صحيح",
  401: "بيانات الدخول غير صحيحة",
  403: "لا تملك صلاحية للقيام بهذا الإجراء",
  404: "لم يتم العثور على البيانات المطلوبة",
  409: "يوجد تعارض في البيانات",
  422: "البيانات المدخلة غير صحيحة",
  500: "حصل خطأ في الخادم، حاول لاحقًا",
};

export const defaultErrorMessage = "حصل خطأ، حاول تاني";
