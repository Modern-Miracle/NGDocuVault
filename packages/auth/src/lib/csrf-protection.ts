/**
 * CSRF Protection Service
 *
 * Provides Cross-Site Request Forgery protection for SIWE authentication
 * by implementing token-based CSRF protection.
 */

// Constants
const CSRF_TOKEN_KEY = 'docu_csrf_token';

/**
 * Generates a cryptographically secure random string
 * Used for creating CSRF tokens
 */
function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF Protection utilities for SIWE requests
 */
export const csrfProtection = {
  /**
   * Generate and store a new CSRF token
   */
  generateToken(): string {
    try {
      const token = generateSecureToken();
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error('Failed to generate CSRF token:', error);
      return '';
    }
  },

  /**
   * Get the current CSRF token, generating a new one if needed
   */
  getToken(): string {
    try {
      let token = sessionStorage.getItem(CSRF_TOKEN_KEY);

      // Generate a new token if one doesn't exist
      if (!token) {
        token = this.generateToken();
      }

      return token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return '';
    }
  },

  /**
   * Validate a CSRF token against the stored token
   */
  validateToken(token: string): boolean {
    try {
      const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
      return !!storedToken && token === storedToken;
    } catch (error) {
      console.error('Failed to validate CSRF token:', error);
      return false;
    }
  },

  /**
   * Add a CSRF token to fetch options
   */
  addTokenToFetchOptions(options: RequestInit = {}): RequestInit {
    const token = this.getToken();

    // Create headers if they don't exist
    const headers = options.headers || {};

    return {
      ...options,
      headers: {
        ...headers,
        'X-CSRF-Token': token,
      },
    };
  },

  /**
   * Creates a fetch wrapper that automatically adds CSRF tokens
   */
  createProtectedFetch(): (input: RequestInfo, init?: RequestInit) => Promise<Response> {
    return (input: RequestInfo, init: RequestInit = {}) => {
      // Add CSRF token to headers
      const protectedInit = this.addTokenToFetchOptions(init);

      // Make the request with the protected options
      return fetch(input, protectedInit);
    };
  },
};

export default csrfProtection;
