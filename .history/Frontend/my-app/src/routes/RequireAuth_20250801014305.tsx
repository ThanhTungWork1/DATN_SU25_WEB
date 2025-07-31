import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  allowedRoles: ("admin" | "user")[];
};

const mapRole = (roleValue: string | null): "admin" | "user" | null => {
  // Mapping theo hệ thống: 0=user, 1=admin, 2=moderator
  if (roleValue === "1") return "admin";
  if (roleValue === "2") return "admin"; // Moderator có quyền admin
  if (roleValue === "0") return "user";

  return null;
};

const RequireAuth = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const storedRole = localStorage.getItem("role");
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("user_token");
  const authToken = localStorage.getItem("authToken");
  const role = mapRole(storedRole);

  // Kiểm tra role
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra token dựa trên role
  if (role === "admin") {
    if (!adminToken) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else if (role === "user") {
    // User có thể có userToken hoặc authToken
    if (!userToken && !authToken) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

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
