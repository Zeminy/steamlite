import { Navigate, Outlet } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  requiredRole?: Role;
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

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
