import { Navigate, useLocation } from "react-router-dom";
import { isTokenExpired } from "../api";

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles = ["admin", "police"] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  if (!token || !user || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
