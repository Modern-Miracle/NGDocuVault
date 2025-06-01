import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
  fallbackPath?: string;
}

/**
 * A component that protects routes requiring specific roles
 * Checks both authentication and role authorization
 */
export function RoleProtectedRoute({
  children,
  requiredRoles,
  fallbackPath = '/unauthorized',
}: RoleProtectedRouteProps) {
  const { isAuthenticated, roles, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse">Verifying authorization...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));

  if (!hasRequiredRole) {
    return (
      <Navigate
        to={fallbackPath}
        state={{
          from: location.pathname,
          requiredRoles: requiredRoles,
        }}
        replace
      />
    );
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
}
