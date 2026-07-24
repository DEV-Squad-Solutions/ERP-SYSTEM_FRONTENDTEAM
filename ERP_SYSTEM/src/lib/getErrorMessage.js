// src/lib/getErrorMessage.js
import {
  errorMessagesMap,
  statusFallbackMessages,
  defaultErrorMessage,
} from "./errorMessages";

export function getErrorMessage(error) {
  if (!error) return null;

  const data = error.data;
  if (!data) return defaultErrorMessage;

  // لو الباك اند رجّع string عادي
  if (typeof data === "string") return data;

  const { title, status, errorType } = data;

  // 1) دور على ترجمة بالكود بتاع title
  if (title && errorMessagesMap[title]) {
    return errorMessagesMap[title];
  }

  // 2) دور على ترجمة بالكود بتاع errorType
  if (errorType && errorMessagesMap[errorType]) {
    return errorMessagesMap[errorType];
  }

  // 3) validation errors (RFC 7807 القديم)
  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstMessage = data.errors[firstKey]?.[0];
    if (firstMessage) return firstMessage;
  }

  // 4) fallback حسب الـ status code
  if (status && statusFallbackMessages[status]) {
    return statusFallbackMessages[status];
  }

  return defaultErrorMessage;
}
