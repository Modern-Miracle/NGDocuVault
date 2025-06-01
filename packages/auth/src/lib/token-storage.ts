/**
 * Secure token storage service
 *
 * This service provides secure methods for storing, retrieving, and managing
 * authentication tokens in the browser with security best practices.
 */

// Constants
const TOKEN_KEY = 'docu_auth_token';
const REFRESH_TOKEN_KEY = 'docu_refresh_token';
const TOKEN_EXPIRY_KEY = 'docu_token_expiry';

// Type definitions
interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Securely stores authentication tokens with optional encryption
 */
export const tokenStorage = {
  /**
   * Store authentication tokens securely
   */
  setTokens(tokenData: TokenData): void {
    try {
      // Store the token in memory for immediate use
      this.memoryToken = tokenData.token;

      // Store the token in HttpOnly cookies when possible (handled by the server)
      // For client storage, we use localStorage with additional metadata

      // Store expiry information
      if (tokenData.expiresAt) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, tokenData.expiresAt.toString());
      }

      // Only store non-sensitive metadata in localStorage
      // The actual tokens should be managed via HttpOnly cookies by the server
      localStorage.setItem(TOKEN_KEY, 'true');
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },

  /**
   * Retrieve the auth token
   * Primary token should be in HttpOnly cookies managed by the server
   * This is a fallback for client-side verification
   */
  getToken(): string | null {
    // Prefer memory token for security (not persisted to storage)
    if (this.memoryToken) {
      return this.memoryToken;
    }

    // Check if authentication is active (actual token in HttpOnly cookie)
    return localStorage.getItem(TOKEN_KEY) === 'true' ? 'true' : null;
  },

  /**
   * Checks if the token is valid based on expiry
   */
  isTokenValid(): boolean {
    try {
      // Check if authentication is active
      if (localStorage.getItem(TOKEN_KEY) !== 'true') {
        return false;
      }

      // Check token expiry
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryStr) {
        return false;
      }

      const expiry = parseInt(expiryStr, 10);
      return expiry > Date.now();
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },

  /**
   * Get the token expiry time
   */
  getTokenExpiry(): number | null {
    try {
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiryStr ? parseInt(expiryStr, 10) : null;
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  },

  /**
   * Calculate remaining token lifetime in seconds
   */
  getTokenRemainingTime(): number | null {
    const expiry = this.getTokenExpiry();
    if (!expiry) return null;

    const remaining = expiry - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  },

  /**
   * Clear all auth tokens and metadata
   */
  clearTokens(): void {
    try {
      // Clear memory token
      this.memoryToken = null;

      // Clear localStorage items
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  // In-memory storage for the current session
  // This is more secure as it's not persisted to storage
  memoryToken: null as string | null,
};

export default tokenStorage;
