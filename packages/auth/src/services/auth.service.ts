/**
 * Unified Auth Service
 *
 * This service provides a clean API for wallet authentication
 * and integrates with server actions for Sign-In with Ethereum (SIWE).
 */

import tokenStorage from '../lib/token-storage';
import { generateSiweNonce, verifySiweSignature, getSiweSession, siweLogout } from '@docu/auth/actions';

export interface AuthResult {
  success: boolean;
  address?: string;
  did?: string;
  role?: string;
  error?: string;
  expiresAt?: number;
}

/**
 * Wallet Authentication Service
 */
export const walletAuthService = {
  /**
   * Authenticate a wallet using Sign-In with Ethereum (SIWE)
   */
  async authenticateWallet(address: string, signature: string, message: string): Promise<AuthResult> {
    try {
      // Call the server action to verify the SIWE signature
      const authResult = await verifySiweSignature(message, signature);

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
        };
      }

      // Extract auth data from response
      const authData = authResult.auth;

      // Set token data in storage if provided
      if (authData?.token) {
        tokenStorage.setTokens({
          token: authData.token,
          refreshToken: authData.refreshToken,
          expiresAt: authData.expiresAt || Date.now() + 24 * 60 * 60 * 1000, // 24h default
        });
      }

      return {
        success: true,
        address: authResult.address,
        did: authData?.did,
        role: authData?.role,
        expiresAt: authData?.expiresAt,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  },

  /**
   * Generate a nonce for SIWE authentication
   */
  async generateNonce(address: string, chainId: string = '1'): Promise<string> {
    try {
      // Use server action to generate nonce
      const response = await generateSiweNonce(address, chainId);
      return response.message;
    } catch (error) {
      console.error('Error generating nonce:', error);
      throw error;
    }
  },

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{
    authenticated: boolean;
    address?: string;
    did?: string;
    role?: string;
  }> {
    try {
      // Check if token is valid
      if (!tokenStorage.isTokenValid()) {
        return { authenticated: false };
      }

      // Use server action to check session status
      const sessionData = await getSiweSession();

      if (!sessionData.authenticated) {
        return { authenticated: false };
      }

      const userData = sessionData.user;

      return {
        authenticated: true,
        address: userData?.address,
        did: userData?.did,
        role: userData?.role,
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false };
    }
  },

  /**
   * Sign out - clear authentication session
   */
  async signOut(): Promise<{ success: boolean }> {
    try {
      // Use server action to logout
      const success = await siweLogout();

      // Clear local storage
      tokenStorage.clearTokens();

      return { success };
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local storage even if API call fails
      tokenStorage.clearTokens();
      return { success: false };
    }
  },
};

export default walletAuthService;
