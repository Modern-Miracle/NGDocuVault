
import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { authStore } from '../store/auth-store';

export interface UseAuthOptions {
  refreshInterval?: number; // Auto refresh interval in ms
  refreshBeforeExpiry?: number; // Refresh X seconds before expiry
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    refreshBeforeExpiry = 60, // 1 minute
  } = options;

  const context = useAuthContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto refresh logic
  useEffect(() => {
    if (!context.isAuthenticated || !refreshInterval) {
      return;
    }

    const checkAndRefresh = async () => {
      const timeUntilExpiry = authStore.getTimeUntilExpiry();
      
      if (timeUntilExpiry && timeUntilExpiry <= refreshBeforeExpiry * 1000) {
        if (!isRefreshing) {
          setIsRefreshing(true);
          try {
            await context.refreshToken();
          } catch (error) {
            console.error('Auto refresh failed:', error);
          } finally {
            setIsRefreshing(false);
          }
        }
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up interval
    const interval = setInterval(checkAndRefresh, refreshInterval);

    return () => clearInterval(interval);
  }, [context, refreshInterval, refreshBeforeExpiry, isRefreshing]);

  const getAccessToken = useCallback(() => {
    return authStore.getAccessToken();
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return context.user?.role === role;
    },
    [context.user]
  );

  return {
    // State
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    user: context.user,
    error: context.error,
    isRefreshing,

    // Actions
    generateChallenge: context.generateChallenge,
    authenticate: context.authenticate,
    signOut: context.signOut,
    refreshToken: context.refreshToken,
    checkAuth: context.checkAuth,

    // Utilities
    getAccessToken,
    hasRole,
  };
}