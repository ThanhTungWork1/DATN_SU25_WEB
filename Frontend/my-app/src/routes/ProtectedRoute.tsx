// import { Navigate } from "react-router-dom";
// import { useAuth } from "../provider/AuthContext";

// type Props = {
//   children: JSX.Element;
//   allowedRoles: ("admin" | "user")[];
// };

// const ProtectedRoute = ({ children, allowedRoles }: Props) => {
//   const { user } = useAuth();

//   if (!user) return <Navigate to="/login" replace />;
//   if (!allowedRoles.includes(user.role)) {
//     return user.role === "admin" ? (
//       <Navigate to="/admin/dashboard" replace />
//     ) : (
//       <Navigate to="/" replace />
//     );
//   }

//   return children;
// };

// export default ProtectedRoute;
