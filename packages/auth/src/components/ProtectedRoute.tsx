import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
  onRedirect?: (path: string) => void;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requiredRole,
  fallback,
  onRedirect,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && onRedirect) {
      onRedirect(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, onRedirect]);

  // Check role requirement
  const hasRequiredRole = !requiredRole || hasRole(requiredRole);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}