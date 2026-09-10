import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { resourceTagsMap } from "../../lib/realtime/resourceTagsMap";
import { baseApi } from "../../lib/baseApi";
import {
  selectAccessToken,
  selectIsAuthenticated,
} from "../../features/auth/authSlice";
import { useEffect, useRef } from "react";
import { RealtimeProvider } from "../../lib/realtime/RealtimeProvider";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  return isAuthenticated ? (
    <RealtimeProvider
      baseApi={baseApi}
      resourceTagsMap={resourceTagsMap}
      getAccessToken={() => accessTokenRef.current}
    >
      {children}
    </RealtimeProvider>
  ) : (
    <Navigate to="/" replace />
  );
}
