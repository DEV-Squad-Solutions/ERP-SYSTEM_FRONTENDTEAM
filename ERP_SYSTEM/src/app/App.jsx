// src/app/App.jsx
import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { RealtimeProvider } from "../lib/realtime/RealtimeProvider";
import { resourceTagsMap } from "../lib/realtime/resourceTagMap";
import { baseApi } from "../lib/baseApi";
import {
  selectAccessToken,
  selectIsAuthenticated,
} from "../features/auth/authSlice";

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  // نحتفظ بآخر توكن في ref بدل ما نمرره كقيمة مباشرة، عشان لو اتجدد
  // بعد refresh (updateTokens) يبقى SignalR بياخد آخر نسخة وقت أي
  // محاولة reconnect، مش النسخة اللي كانت موجودة وقت فتح الاتصال أول مرة.
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // مفيش اتصال SignalR قبل تسجيل الدخول الكامل (isAuthenticated بياخد
  // في الاعتبار requiresCompanySelection تلقائيًا حسب الـ slice عندك).
  // ولما يعمل logout، الـ Provider بيتفكك من الشجرة فيتنفذ الـ cleanup
  // بتاعه (stopConnection) تلقائيًا.
  if (!isAuthenticated) {
    return <RouterProvider router={router} />;
  }

  return (
    <RealtimeProvider
      baseApi={baseApi}
      resourceTagsMap={resourceTagsMap}
      getAccessToken={() => accessTokenRef.current}
    >
      <RouterProvider router={router} />
    </RealtimeProvider>
  );
}
