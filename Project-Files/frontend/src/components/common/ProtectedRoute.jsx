// components/common/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("userData");
  return isAuthenticated ? children : <Navigate to="/login" />;
}
