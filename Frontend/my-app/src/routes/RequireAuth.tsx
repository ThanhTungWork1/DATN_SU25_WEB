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
  const userToken = localStorage.getItem("user_token");
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("admin_token");
  const role = mapRole(storedRole);

  // Nếu không có role, redirect đến login
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đang truy cập trang client (allowedRoles = ["user"])
  if (allowedRoles.includes("user")) {
    // Admin có thể truy cập trang client nếu có userToken
    if (role === "admin" && (userToken || token)) {
      return <Outlet />;
    }

    // User có thể truy cập trang client
    if (role === "user" && (userToken || token)) {
      return <Outlet />;
    }
  }

  // Nếu đang truy cập trang admin (allowedRoles = ["admin"])
  if (allowedRoles.includes("admin")) {
    if (role === "admin" && adminToken) {
      return <Outlet />;
    }
  }

  // Nếu không có quyền, redirect
  if (role === "admin") {
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default RequireAuth;
