import { Navigate, Outlet, useLocation } from "react-router-dom";
import { TokenManager } from "../utils/tokenUtils";

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

  // Debug log
  console.log("RequireAuth Debug:", {
    storedRole,
    role,
    userToken: !!userToken,
    token: !!token,
    adminToken: !!adminToken,
    allowedRoles,
    currentPath: location.pathname
  });

  // Nếu không có role, redirect đến login
  if (!role) {
    console.log("No role found, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đang truy cập trang client (allowedRoles = ["user"])
  if (allowedRoles.includes("user")) {
    // Admin có thể truy cập trang client nếu có userToken
    if (role === "admin" && (userToken || token)) {
      console.log("Admin accessing client page with user token - allowed");
      return <Outlet />;
    }
    
    // User có thể truy cập trang client
    if (role === "user" && (userToken || token)) {
      console.log("User accessing client page - allowed");
      return <Outlet />;
    }
  }

  // Nếu đang truy cập trang admin (allowedRoles = ["admin"])
  if (allowedRoles.includes("admin")) {
    if (role === "admin" && adminToken) {
      console.log("Admin accessing admin page - allowed");
      return <Outlet />;
    }
  }

  // Nếu không có quyền, redirect
  console.log("Access denied, redirecting");
  if (role === "admin") {
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


};

export default RequireAuth;