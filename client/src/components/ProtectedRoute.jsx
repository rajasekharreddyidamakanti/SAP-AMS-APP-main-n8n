// src/components/ProtectedRoute.jsx
// Protects pages — if not logged in, sends to /login
// Also prevents back-button bypass: if user manually presses back to /login,
// the login page itself redirects them away if already logged in.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // No user in memory → kick to login
  if (!user) return <Navigate to="/login" replace />;

  // Also check token exists in storage (handles cleared storage edge case)
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;