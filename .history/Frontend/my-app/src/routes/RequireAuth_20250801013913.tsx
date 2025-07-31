import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  allowedRoles: ("admin" | "user")[];
};

const mapRole = (roleValue: string | null): "admin" | "user" | null => {
  console.log("🔍 [DEBUG] Mapping role value:", roleValue, "type:", typeof roleValue);
  
  // Mapping theo hệ thống: 0=user, 1=admin, 2=moderator
  if (roleValue === "1") return "admin";
  if (roleValue === "2") return "admin"; // Moderator có quyền admin
  if (roleValue === "0") return "user";
  
  console.log("🔍 [DEBUG] No role mapping found for:", roleValue);
  return null;
};

const RequireAuth = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const storedRole = localStorage.getItem("role");
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("user_token");
  const authToken = localStorage.getItem("authToken");
  const role = mapRole(storedRole);

  console.log("RequireAuth - storedRole:", storedRole, "mapped role:", role, "adminToken:", adminToken, "userToken:", userToken);

  // Kiểm tra role
  if (!role) {
    console.log("No role found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra token dựa trên role
  if (role === "admin") {
    if (!adminToken) {
      console.log("Admin role but no admin token, redirecting to admin login");
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else if (role === "user") {
    // User có thể có userToken hoặc authToken
    if (!userToken && !authToken) {
      console.log("User role but no user token, redirecting to user login");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (!allowedRoles.includes(role)) {
    console.log("Role not allowed:", role, "allowed:", allowedRoles);
    return role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
