import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

import { updateTokens, logout } from "../features/auth/authSlice";
import { getApiErrors } from "../utils/getApiErrors";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const showErrors = (error) => {
  const messages = [...new Set(getApiErrors(error))];

  messages.forEach((message) => {
    toast.error(message);
  });
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // لو الـ Access Token انتهى
  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    // لو مفيش Refresh Token
    if (!refreshToken) {
      showErrors(result.error);
      api.dispatch(logout());
      return result;
    }

    // محاولة تجديد الـ Token
    const refreshResult = await baseQuery(
      {
        url: "/Auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // حفظ التوكن الجديد
      api.dispatch(
        updateTokens({
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken ?? refreshToken,
        }),
      );

      // إعادة تنفيذ الطلب الأصلي
      result = await baseQuery(args, api, extraOptions);

      // لو فشل بعد التجديد
      if (result.error) {
        showErrors(result.error);
      }
    } else {
      showErrors(refreshResult.error);
      api.dispatch(logout());
    }

    return result;
  }

  // أي Error غير 401
  if (result.error) {
    showErrors(result.error);
  }

  return result;
};

export default baseQueryWithReauth;
