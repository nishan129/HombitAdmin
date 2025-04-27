import React from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const auth = useSelector((state) => state.auth);

  const location = useLocation();
  return auth.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth" state={{ from: location.pathname }} />
  );
}
