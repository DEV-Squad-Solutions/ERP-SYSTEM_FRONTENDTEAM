import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { updateTokens, logout } from "../features/auth/authSlice";

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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "/Auth/refresh",
        method: "POST",
        body: {
          refreshToken,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      api.dispatch(
        updateTokens({
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken ?? refreshToken,
        }),
      );

      // إعادة تنفيذ الطلب الأصلي
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export default baseQueryWithReauth;
