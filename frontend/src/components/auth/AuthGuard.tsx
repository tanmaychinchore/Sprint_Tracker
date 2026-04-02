import { Navigate, Outlet, useLocation } from "react-router-dom";

export function AuthGuard() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If no token exists, redirect completely to the login flow
  // and remember the intended location to redirect back to later if needed.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, seamlessly render the child authenticated layouts/routes.
  return <Outlet />;
}
