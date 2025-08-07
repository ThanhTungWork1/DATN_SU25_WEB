import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  allowedRoles: ("admin" | "user")[];
};

const mapRole = (roleValue: string | null): "admin" | "user" | null => {
  if (roleValue === "1") return "admin";
  if (roleValue === "0") return "user";
  if (roleValue === "2") return "admin"; // Moderator có quyền admin
  return null;
};

const RequireAuth = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const storedRole = localStorage.getItem("role");
  const role = mapRole(storedRole);

  console.log("RequireAuth - storedRole:", storedRole, "mapped role:", role);

  if (!role) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!allowedRoles.includes(role)) {
    return role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
