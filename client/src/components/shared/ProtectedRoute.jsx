import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '../../store/authStore.js';

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
