import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { TokenManager } from '../utils/tokenUtils';

const AdminGuard: React.FC = () => {
  const location = useLocation();
  
  // Kiểm tra admin token và role
  const adminToken = TokenManager.getAdminToken();
  const storedRole = localStorage.getItem("role");
  const adminUser = localStorage.getItem("admin_user");
  
  console.log("AdminGuard check:", {
    adminToken: !!adminToken,
    role: storedRole,
    hasAdminUser: !!adminUser,
    currentPath: location.pathname
  });
  
  // Nếu không có admin token hoặc role không phải admin
  if (!adminToken || storedRole !== "1") {
    console.log("AdminGuard: Redirecting to admin login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Nếu có đầy đủ quyền admin
  return <Outlet />;
};

export default AdminGuard;
