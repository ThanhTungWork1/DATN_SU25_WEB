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

  console.log("🔒 RequireAuth check:", {
    allowedRoles,
    storedRole,
    role,
    hasUserToken: !!userToken,
    hasToken: !!token,
    hasAdminToken: !!adminToken,
    currentPath: location.pathname,
  });

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

  // Nếu không có quyền, redirect về admin login nếu đang truy cập admin route
  if (location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;
