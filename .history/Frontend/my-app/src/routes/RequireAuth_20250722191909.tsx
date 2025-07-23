import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  allowedRoles: ("admin" | "user")[];
};

const mapRole = (roleValue: string | null): "admin" | "user" | null => {
  if (roleValue === "1") return "admin";
  if (roleValue === "0") return "user";
  return null;
};

const RequireAuth = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const storedRole = localStorage.getItem("role");
  const role = mapRole(storedRole);

  if (!role) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!allowedRoles.includes(role)) {
    return role === "admin"
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
