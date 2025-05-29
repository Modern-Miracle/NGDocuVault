import { authStore } from '../store/auth-store';

/**
 * Create an authenticated fetch function
 */
export function createAuthenticatedFetch(baseUrl?: string) {
  return async (url: string, options: RequestInit = {}) => {
    const token = authStore.getAccessToken();
    
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

    return fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  };
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Calculate time until token expiry
 */
export function getTimeUntilExpiry(expiresAt: number): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true };
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return { minutes, seconds, isExpired: false };
}

/**
 * Parse JWT token without verification (client-side only)
 */
export function parseJWT(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = authStore.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}