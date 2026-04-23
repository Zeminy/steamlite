import { Navigate, Outlet } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  requiredRole?: Role | Role[];
};

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-shell">
        <div className="panel">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
