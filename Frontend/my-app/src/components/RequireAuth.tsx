// src/components/RequireAuth.tsx
import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  role?: "admin" | "user";
};

const RequireAuth: React.FC<Props> = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/profile"} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
