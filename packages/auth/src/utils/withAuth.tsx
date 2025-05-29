
import React, { ComponentType } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

export interface WithAuthOptions {
  redirectTo?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component for protecting pages/components
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * HOC that injects auth props into the component
 */
export function withAuthProps<P extends object>(Component: ComponentType<P & ReturnType<typeof useAuth>>) {
  return function ComponentWithAuth(props: P) {
    const authProps = useAuth();
    return <Component {...props} {...authProps} />;
  };
}