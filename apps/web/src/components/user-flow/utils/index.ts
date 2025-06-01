/**
 * Utility functions for authentication in React app
 */

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_TOKEN_KEY, token);

  // Optionally set expiration time
  if (expiresIn) {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(`${AUTH_TOKEN_KEY}_expires`, expiryTime.toString());
  }
}

/**
 * Set the refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(`${AUTH_TOKEN_KEY}_expires`);
}

/**
 * Check if the authentication token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;

  const expiryTime = localStorage.getItem(`${AUTH_TOKEN_KEY}_expires`);
  if (!expiryTime) return false; // No expiry set, assume valid

  return Date.now() > parseInt(expiryTime);
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!(token && !isTokenExpired());
}

/**
 * Get the redirect URL from the query parameters
 * @param defaultRedirect The default redirect URL if no redirect is specified
 * @returns The redirect URL
 */
export function getRedirectUrl(defaultRedirect: string = '/'): string {
  if (typeof window === 'undefined') return defaultRedirect;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  // Validate the redirect URL to prevent open redirect vulnerabilities
  if (redirectUrl) {
    try {
      // Check if the URL is relative (starts with /)
      if (redirectUrl.startsWith('/')) {
        return redirectUrl;
      }

      // Check if the URL is on the same domain
      const url = new URL(redirectUrl, window.location.origin);
      if (url.origin === window.location.origin) {
        return redirectUrl;
      }
    } catch (error) {
      console.error('Invalid redirect URL:', error);
    }
  }

  return defaultRedirect;
}

/**
 * Create authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
