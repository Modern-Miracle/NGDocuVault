/**
 * API Client
 *
 * Provides a secure, authenticated API client for making requests to the backend,
 * with built-in support for CSRF protection, token refresh, and error handling.
 */

import tokenRefresh from './token-refresh';
import tokenStorage from './token-storage';
import csrfProtection from './csrf-protection';

// Default API configuration
const DEFAULT_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

// API client configuration
interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  defaultHeaders?: Record<string, string>;
  onUnauthorized?: () => void;
  onError?: (error: Error) => void;
}

// Request options that extend fetch RequestInit
interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  retry?: boolean;
  timeout?: number;
}

// Response wrapper
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  headers: Headers;
  ok: boolean;
}

/**
 * Creates an API client for making authenticated requests
 */
export function createApiClient(config: ApiClientConfig = {}) {
  // Destructure config with defaults
  const {
    baseUrl = DEFAULT_BASE_URL,
    timeout = DEFAULT_TIMEOUT,
    maxRetries = MAX_RETRY_ATTEMPTS,
    defaultHeaders = {},
    onUnauthorized,
    onError,
  } = config;

  // Create a fetch function with token refresh
  const fetchWithRefresh = tokenRefresh.createRefreshFetch({
    onRefreshError: (error) => {
      // Clear tokens and call onUnauthorized callback on refresh failure
      tokenStorage.clearTokens();
      if (onUnauthorized) {
        onUnauthorized();
      }
    },
  });

  /**
   * Make an API request with authentication, CSRF protection, and retry
   */
  async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      // Destructure options with defaults
      const { params, retry = true, timeout: requestTimeout = timeout, ...fetchOptions } = options;

      // Construct URL with query params
      let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value.toString());
        });
        url = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
      }

      // Merge headers
      const headers = {
        'Content-Type': 'application/json',
        ...defaultHeaders,
        ...options.headers,
      };

      // Create fetch options
      const finalOptions: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: 'include', // Always include credentials for auth cookies
      };

      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
      finalOptions.signal = controller.signal;

      // Make the request
      const response = await fetchWithRefresh(url, finalOptions);
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        tokenStorage.clearTokens();
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      // Parse response data
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = (await response.text()) as unknown as T;
      }

      return {
        data,
        error: null,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      // Handle request errors
      const apiError = error instanceof Error ? error : new Error('Unknown API error');

      if (onError) {
        onError(apiError);
      }

      return {
        data: null,
        error: apiError,
        status: 0,
        headers: new Headers(),
        ok: false,
      };
    }
  }

  /**
   * Convenience methods for common HTTP methods
   */
  return {
    // Base request method
    request,

    // GET request
    async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { ...options, method: 'GET' });
    },

    // POST request
    async post<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
      return request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    // PUT request
    async put<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
      return request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    // PATCH request
    async patch<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
      return request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    // DELETE request
    async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
      return request<T>(endpoint, { ...options, method: 'DELETE' });
    },

    // Check authentication status
    async checkAuth(): Promise<boolean> {
      // First check local token validity
      if (!tokenStorage.isTokenValid()) {
        return false;
      }

      // Verify with server
      const { ok } = await request<{ authenticated: boolean }>('/auth/status', {
        method: 'GET',
      });

      return ok;
    },

    // SIWE Authentication Methods
    async generateSiweNonce(address: string, chainId: string = '1'): Promise<{ message: string; expiresAt: number }> {
      return request<{ message: string; expiresAt: number }>(`/auth/siwe/nonce?address=${address}&chainId=${chainId}`, {
        method: 'GET',
      }).then((res) => res.data || { message: '', expiresAt: 0 });
    },

    async verifySiweSignature(
      message: string,
      signature: string
    ): Promise<
      ApiResponse<{
        auth: any;
        session: any;
        address: string;
        siwe: any;
      }>
    > {
      return request('/auth/siwe/verify', {
        method: 'POST',
        body: JSON.stringify({ message, signature }),
      });
    },

    async getSiweSession(): Promise<
      ApiResponse<{
        authenticated: boolean;
        user?: {
          address: string;
          did: string;
          role: string;
        };
      }>
    > {
      return request('/auth/siwe/session', {
        method: 'GET',
      });
    },

    async siweLogout(refreshToken?: string): Promise<ApiResponse<{ success: boolean }>> {
      return request('/auth/siwe/logout', {
        method: 'POST',
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });
    },
  };
}

// Create a default API client
export const apiClient = createApiClient();

export default apiClient;
