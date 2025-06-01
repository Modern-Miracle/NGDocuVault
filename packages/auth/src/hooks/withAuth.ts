'use client';

import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/use-wallet-auth';

/**
 * Higher-order function that wraps an API request with automatic token refresh
 * @param apiCall The API function to call
 * @param refreshAuthFunction Function to refresh authentication
 * @param options Options for the wrapper
 * @returns A function that executes the API call with automatic token refresh
 */
export function withAuth<T extends (...args: unknown[]) => Promise<unknown>>(
  apiCall: T,
  refreshAuthFunction: () => Promise<{ success: boolean; error?: string }>,
  options: {
    showErrorToast?: boolean;
    maxRetries?: number;
  } = {}
) {
  const { showErrorToast = true, maxRetries = 1 } = options;

  return async function wrappedApiCall(...args: Parameters<T>): Promise<ReturnType<T>> {
    try {
      return (await apiCall(...args)) as ReturnType<T>;
    } catch (error) {
      // Check if error is due to authentication
      const isAuthError =
        error instanceof Error &&
        (error.message.includes('401') ||
          error.message.includes('unauthorized') ||
          error.message.includes('token expired'));

      if (isAuthError) {
        let retries = 0;

        // Try to refresh token and retry the request
        while (retries < maxRetries) {
          try {
            // Try refreshing the token
            const refreshResult = await refreshAuthFunction();

            if (refreshResult.success) {
              // If refresh succeeded, retry the original request
              return (await apiCall(...args)) as ReturnType<T>;
            } else {
              // If refresh failed, throw an error
              throw new Error('Failed to refresh authentication token');
            }
          } catch {
            // Ignore the specific error, just increment retry counter
            retries++;
            if (retries >= maxRetries) {
              if (showErrorToast) {
                toast.error('Your session has expired. Please sign in again.');
              }
              throw new Error('Authentication failed after retry attempts');
            }
          }
        }
      }

      // Re-throw the original error for non-auth errors or if all retries failed
      if (showErrorToast) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast.error(`API request failed: ${message}`);
      }
      throw error;
    }
  };
}

/**
 * Custom hook for creating an API caller with auth refresh
 */
export function useAuthApi() {
  // This is a proper custom hook, so useWalletAuth is safe to use here
  const { isAuthenticated, refreshAuth } = useWalletAuth();

  return {
    /**
     * Call an API function with authentication and token refresh
     */
    callApi: async <T>(
      apiFunction: () => Promise<T>,
      options: {
        requireAuth?: boolean;
        showErrorToast?: boolean;
        maxRetries?: number;
      } = {}
    ): Promise<T> => {
      const { requireAuth = true, showErrorToast = true, maxRetries = 1 } = options;

      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        if (showErrorToast) {
          toast.error('Authentication required');
        }
        throw new Error('Authentication required');
      }

      try {
        return await apiFunction();
      } catch (error) {
        // Check if error is due to authentication
        const isAuthError =
          error instanceof Error &&
          (error.message.includes('401') ||
            error.message.includes('unauthorized') ||
            error.message.includes('token expired'));

        if (isAuthError) {
          let retries = 0;

          // Try to refresh token and retry the request
          while (retries < maxRetries) {
            try {
              // Try refreshing the token
              const refreshResult = await refreshAuth();

              if (refreshResult.success) {
                // If refresh succeeded, retry the original request
                return await apiFunction();
              } else {
                // If refresh failed, throw an error
                throw new Error('Failed to refresh authentication token');
              }
            } catch {
              // Ignore the specific error, just increment retry counter
              retries++;
              if (retries >= maxRetries) {
                if (showErrorToast) {
                  toast.error('Your session has expired. Please sign in again.');
                }
                throw new Error('Authentication failed after retry attempts');
              }
            }
          }
        }

        // Re-throw the original error for non-auth errors or if all retries failed
        if (showErrorToast) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          toast.error(`API request failed: ${message}`);
        }
        throw error;
      }
    },

    /**
     * Wrap an API function with authentication and token refresh
     */
    wrapApi: <T extends (...args: unknown[]) => Promise<unknown>>(
      apiFunction: T,
      options: {
        requireAuth?: boolean;
        showErrorToast?: boolean;
        maxRetries?: number;
      } = {}
    ) => {
      return withAuth(apiFunction, refreshAuth, options);
    },
  };
}
