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
  
  // **FIX: Kiểm tra token phù hợp với context admin/user**
  const isAdminRoute = location.pathname.includes('/admin');
  
  if (isAdminRoute) {
    // Nếu là admin route, kiểm tra admin token
    const adminToken = TokenManager.getAdminToken();
    const storedRole = localStorage.getItem("role");
    
    console.log("Admin route - adminToken:", !!adminToken, "role:", storedRole);
    
    if (!adminToken || storedRole !== "1") {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    const role = mapRole(storedRole);
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    // Nếu là user route, kiểm tra user token
    const userToken = TokenManager.getUserToken();
    const storedRole = localStorage.getItem("role");
    
    console.log("User route - userToken:", !!userToken, "role:", storedRole);
    
    if (!userToken) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    const role = mapRole(storedRole);
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default RequireAuth;
