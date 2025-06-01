/**
 * Token Refresh Service
 *
 * Provides automatic refresh of authentication tokens before they expire.
 * Implements refresh token rotation for enhanced security.
 */

import tokenStorage from './token-storage';
import csrfProtection from './csrf-protection';

// Constants for refresh timing
const DEFAULT_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
const DEFAULT_REFRESH_ENDPOINT = '/api/auth/refresh';

interface RefreshOptions {
  refreshEndpoint?: string;
  refreshThreshold?: number; // Time in seconds before expiry to trigger refresh
  onRefreshSuccess?: (newExpiryTime: number) => void;
  onRefreshError?: (error: Error) => void;
}

/**
 * Automatic token refresh service
 */
export const tokenRefresh = {
  // Track if a refresh is currently in progress
  isRefreshing: false,

  // Queue of functions to call after token is refreshed
  refreshCallbacks: [] as Array<(token: string) => void>,

  // Interval ID for refresh timer
  refreshIntervalId: null as number | null,

  /**
   * Schedule a token refresh before it expires
   */
  scheduleRefresh(options: RefreshOptions = {}): void {
    // Clear any existing refresh timer
    this.clearRefreshTimer();

    // Destructure options with defaults
    const { refreshThreshold = DEFAULT_REFRESH_THRESHOLD, onRefreshSuccess, onRefreshError } = options;

    // Get remaining time on the current token
    const remainingTime = tokenStorage.getTokenRemainingTime();

    // If no token or already expired, don't schedule
    if (!remainingTime) return;

    // Calculate when to refresh (remaining time minus threshold)
    const refreshIn = Math.max(0, remainingTime - refreshThreshold);

    // Schedule the refresh
    this.refreshIntervalId = window.setTimeout(() => {
      this.refreshToken({
        ...options,
        onRefreshSuccess,
        onRefreshError,
      });
    }, refreshIn * 1000); // Convert to milliseconds
  },

  /**
   * Clear the refresh timer
   */
  clearRefreshTimer(): void {
    if (this.refreshIntervalId !== null) {
      clearTimeout(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  },

  /**
   * Refresh the authentication token
   */
  async refreshToken(options: RefreshOptions = {}): Promise<boolean> {
    try {
      // If already refreshing, return a promise that resolves when done
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          this.refreshCallbacks.push(() => resolve(true));
        });
      }

      // Mark as refreshing
      this.isRefreshing = true;

      // Destructure options with defaults
      const { refreshEndpoint = DEFAULT_REFRESH_ENDPOINT, onRefreshSuccess, onRefreshError } = options;

      // Create a protected fetch with CSRF token
      const protectedFetch = csrfProtection.createProtectedFetch();

      // Call refresh endpoint
      const response = await protectedFetch(refreshEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update token expiry based on server response
      if (data.expiresAt) {
        const expiryTime = typeof data.expiresAt === 'string' ? new Date(data.expiresAt).getTime() : data.expiresAt;

        // Update stored token expiry
        tokenStorage.setTokens({
          token: 'true', // Actual token is in HttpOnly cookie
          expiresAt: expiryTime,
        });

        // Schedule next refresh
        this.scheduleRefresh(options);

        // Call success callback
        if (onRefreshSuccess) {
          onRefreshSuccess(expiryTime);
        }
      }

      // Process any callbacks that were waiting for refresh
      if (this.refreshCallbacks.length > 0) {
        this.refreshCallbacks.forEach((callback) => callback('true'));
        this.refreshCallbacks = [];
      }

      return true;
    } catch (error) {
      // Reset token storage on refresh failure
      tokenStorage.clearTokens();

      if (options.onRefreshError) {
        options.onRefreshError(error instanceof Error ? error : new Error('Unknown error during token refresh'));
      }

      // Process any callbacks with error
      if (this.refreshCallbacks.length > 0) {
        this.refreshCallbacks.forEach((callback) => callback(''));
        this.refreshCallbacks = [];
      }

      return false;
    } finally {
      this.isRefreshing = false;
    }
  },

  /**
   * Setup refresh interceptor for fetch requests
   * Returns a fetch function that handles token refreshing
   */
  createRefreshFetch(options: RefreshOptions = {}): (input: RequestInfo, init?: RequestInit) => Promise<Response> {
    // Get protected fetch with CSRF tokens
    const protectedFetch = csrfProtection.createProtectedFetch();

    // Return a fetch wrapper that handles token refresh
    return async (input: RequestInfo, init: RequestInit = {}) => {
      try {
        // Make the request
        const response = await protectedFetch(input, init);

        // If response is 401 Unauthorized, try to refresh token
        if (response.status === 401) {
          // Attempt to refresh the token
          const refreshSuccess = await this.refreshToken(options);

          // If refresh was successful, retry the original request
          if (refreshSuccess) {
            return protectedFetch(input, init);
          }
        }

        return response;
      } catch (error) {
        // Handle fetch errors
        console.error('Request failed:', error);
        throw error;
      }
    };
  },
};

export default tokenRefresh;
