import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
  requireDid?: boolean;
}

/**
 * A component that protects routes requiring authentication
 * Redirects to auth page if user is not authenticated
 */
export function ProtectedRoute({ children, redirectPath = '/auth/siwe', requireDid = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, did } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  if (requireDid && !did) {
    return <Navigate to={redirectPath} state={{ from: location.pathname, requireDid: true }} replace />;
  }

  return <>{children}</>;
}
