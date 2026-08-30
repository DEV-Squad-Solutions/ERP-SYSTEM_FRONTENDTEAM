import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectRoles,
} from "../../features/auth/authSlice";
import UnauthorizedPage from "./UnauthorizedPage";

export default function RoleRoute({ roles, children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRoles = useSelector(selectRoles);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  const normalizedUserRoles = userRoles.map((role) =>
    String(role).trim().toLowerCase(),
  );

  const hasRole = requiredRoles.some((role) =>
    normalizedUserRoles.includes(String(role).trim().toLowerCase()),
  );

  if (!hasRole) {
    return <UnauthorizedPage />;
  }

  return children || <Outlet />;
}
