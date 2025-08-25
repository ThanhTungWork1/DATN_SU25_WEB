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
  const legacyToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("admin_token");
  const role = mapRole(storedRole);

  console.log("🔒 RequireAuth check:", {
    allowedRoles,
    storedRole,
    role,
    hasUserToken: !!userToken,
    hasLegacyToken: !!legacyToken,
    hasAdminToken: !!adminToken,
    currentPath: location.pathname,
  });

  // Nếu không có role, redirect đến login
  if (!role) {
    console.log("❌ No role found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra token dựa trên context
  const currentPath = location.pathname;
  const isAdminContext = currentPath.startsWith("/admin");

  if (isAdminContext) {
    // Admin context - cần admin token
    if (role === "admin" && adminToken) {
      console.log("✅ Admin access granted");
      return <Outlet />;
    } else {
      console.log("❌ Admin access denied, redirecting to admin login");
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else {
    // Client context - cần user token hoặc legacy token
    const hasValidToken = userToken || legacyToken;

    if (hasValidToken) {
      console.log("✅ Client access granted");
      return <Outlet />;
    } else {
      console.log("❌ Client access denied, redirecting to login");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }
};

export default RequireAuth;
