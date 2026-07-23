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
