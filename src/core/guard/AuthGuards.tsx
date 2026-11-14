import { Navigate, Outlet } from "react-router";
import { useApp } from "../../app/context/AppContext";
import { environment } from "../../environment";

export function ProtectedRoute() {
  const { isLoggedIn } = useApp();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
export function LoginRoute() {
  const { isLoggedIn } = useApp();
  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
}
export function RecoveryRoute() {
  return environment.features.securityQuestionsEnabled ? <Outlet /> : <Navigate to="/login" replace />;
}
export function AdminRoute() {
  const { currentUser } = useApp();
  return currentUser?.cargo === "Administrador" ? <Outlet /> : <Navigate to="/" replace />;
}