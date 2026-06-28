import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user?.app_metadata?.role;

  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
