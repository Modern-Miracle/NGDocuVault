'use client';
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSiwe } from '../providers/siwe-provider';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  loading?: ReactNode;
}

/**
 * ProtectedRoute component ensures a user is authenticated before rendering content
 *
 * @param children - The content to render when authenticated
 * @param fallback - Optional content to render when not authenticated (instead of redirecting)
 * @param redirectTo - Path to redirect to when not authenticated (defaults to '/')
 * @param loading - Optional loading state to show while checking authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, redirectTo = '/', loading }) => {
  const { isAuthenticated, isConnected } = useSiwe();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    // Short timeout to allow for any pending auth checks to complete
    const timer = setTimeout(() => {
      setIsChecking(false);

      // If not authenticated and no fallback is provided, redirect
      if (!isAuthenticated && !fallback) {
        router.push(redirectTo);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, redirectTo, fallback]);

  // Show loading state while checking
  if (isChecking) {
    return loading ? <>{loading}</> : <div>Loading authentication status...</div>;
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated but fallback is provided, render fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // This will rarely be seen as the useEffect will redirect,
  // but it's here as a fallback during the redirect
  return <div>Redirecting to login...</div>;
};

export default ProtectedRoute;
