import RoleRoute from "./RoleRoute";

export default function AdminRoute({ children }) {
  return <RoleRoute roles="Admin">{children} </RoleRoute>;
}
