'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getSiweSession, siweLogout, refreshAuthToken } from '../actions';

// Constants for disconnection handling
const RECENTLY_DISCONNECTED_KEY = 'recently_disconnected';
const DISCONNECT_COOLDOWN_MS = 10000; // 10 seconds cooldown

interface WalletAuthContextType {
  isAuthenticated: boolean;
  walletAddress: string | null;
  isAuthenticating: boolean;
  recentlyDisconnected: boolean;
  sessionExpiresAt?: number;
  checkAuthStatus: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshAuth: () => Promise<{
    success: boolean;
    error?: string;
    expiresAt?: number;
  }>;
}

export const WalletAuthContext = createContext<WalletAuthContextType>({
  isAuthenticated: false,
  walletAddress: null,
  isAuthenticating: false,
  recentlyDisconnected: false,
  checkAuthStatus: async () => false,
  disconnect: async () => {},
  refreshAuth: async () => ({ success: false }),
});

interface WalletAuthProviderProps {
  children: ReactNode;
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [recentlyDisconnected, setRecentlyDisconnected] = useState<boolean>(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | undefined>(undefined);
  const [hasNotifiedSuccess, setHasNotifiedSuccess] = useState(false);
  const { address: wagmiAddress } = useAccount();
  const lastCheckedRef = useRef<number>(0);

  // On mount, check if we have a recently disconnected flag
  useEffect(() => {
    try {
      const disconnectedTime = localStorage.getItem(RECENTLY_DISCONNECTED_KEY);
      if (disconnectedTime) {
        const disconnectTimestamp = parseInt(disconnectedTime, 10);
        const now = Date.now();

        // If the disconnect happened less than the cooldown time ago, set the flag
        if (now - disconnectTimestamp < DISCONNECT_COOLDOWN_MS) {
          setRecentlyDisconnected(true);

          // Set a timeout to clear the recently disconnected state after the cooldown
          const timeoutId = setTimeout(
            () => {
              setRecentlyDisconnected(false);
              localStorage.removeItem(RECENTLY_DISCONNECTED_KEY);
            },
            DISCONNECT_COOLDOWN_MS - (now - disconnectTimestamp)
          );

          return () => clearTimeout(timeoutId);
        } else {
          // If cooldown has already expired, clean up
          localStorage.removeItem(RECENTLY_DISCONNECTED_KEY);
        }
      }
    } catch (err) {
      console.error('Error checking recently disconnected state:', err);
    }
  }, []);

  // Refresh tokens function
  const refreshAuth = async () => {
    try {
      setIsAuthenticating(true);
      const result = await refreshAuthToken();

      if (result.success) {
        setIsAuthenticated(true);
        if (result.expiresAt) {
          setSessionExpiresAt(result.expiresAt);
        }
        return result;
      } else {
        console.warn('Token refresh failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('Error refreshing authentication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error refreshing authentication',
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check authentication status with debouncing
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Debounce repeated calls - only allow checks every 5 seconds
      const now = Date.now();
      if (isAuthenticating || now - lastCheckedRef.current < 5000) {
        // Return current state if we're already checking or checked recently
        return isAuthenticated;
      }

      // Skip auth check if recently disconnected
      if (recentlyDisconnected) {
        console.log('Skipping auth check due to recent disconnection');
        return false;
      }

      setIsAuthenticating(true);
      lastCheckedRef.current = now;

      // Check if token needs refresh
      if (sessionExpiresAt && sessionExpiresAt < Date.now()) {
        console.log('Session expired, attempting refresh');
        const refreshResult = await refreshAuth();
        if (!refreshResult.success) {
          setIsAuthenticated(false);
          setWalletAddress(null);
          setSessionExpiresAt(undefined);
          return false;
        }
      }

      // Check with the server for current session status using server action
      const sessionData = await getSiweSession();

      const authenticated = sessionData.authenticated;
      const address = sessionData.user?.address || null;

      // Update state based on response
      setIsAuthenticated(authenticated);
      setWalletAddress(address);

      // If we're authenticated but the addresses don't match, something's wrong
      if (authenticated && wagmiAddress && address && wagmiAddress.toLowerCase() !== address.toLowerCase()) {
        console.warn('Wallet address mismatch between session and connected wallet');
        return false;
      }

      // Only show toast once when authenticated
      if (authenticated && !hasNotifiedSuccess) {
        console.log('Authentication successful:', {
          address,
          authenticated: true,
          expiresAt: sessionExpiresAt ? new Date(sessionExpiresAt).toISOString() : 'unknown',
        });
        setHasNotifiedSuccess(true);
      }

      return authenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticated, isAuthenticating, wagmiAddress, recentlyDisconnected, sessionExpiresAt, hasNotifiedSuccess]);

  // Disconnect wallet
  const disconnect = async (): Promise<void> => {
    try {
      // Call the backend to invalidate the session using server action
      await siweLogout();

      // Update state
      setIsAuthenticated(false);
      setWalletAddress(null);
      setSessionExpiresAt(undefined);
      setHasNotifiedSuccess(false);
      setRecentlyDisconnected(true);

      // Store disconnect timestamp in localStorage with expiration
      try {
        localStorage.setItem(RECENTLY_DISCONNECTED_KEY, Date.now().toString());
      } catch (err) {
        console.warn('Could not store disconnect state in localStorage:', err);
      }

      // Reset the recently disconnected flag after cooldown
      setTimeout(() => {
        setRecentlyDisconnected(false);
      }, DISCONNECT_COOLDOWN_MS);
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  };

  // Check auth status on initial load - ONCE only
  useEffect(() => {
    checkAuthStatus();
    // We intentionally only run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if token needs refresh periodically
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) return;

    // Calculate time until expiry
    const now = Date.now();
    const timeUntilExpiry = sessionExpiresAt - now;

    // If token is expired, refresh it immediately
    if (timeUntilExpiry <= 0) {
      refreshAuth();
      return;
    }

    // If token expires in less than 1 minute, refresh it
    if (timeUntilExpiry < 60 * 1000) {
      refreshAuth();
      return;
    }

    // Schedule refresh for 1 minute before expiry
    const refreshTime = timeUntilExpiry - 60 * 1000;

    // Set up timer to refresh before expiry
    const timerId = setTimeout(() => {
      refreshAuth();
    }, refreshTime);

    // Clean up timer on unmount or if dependencies change
    return () => clearTimeout(timerId);
  }, [isAuthenticated, sessionExpiresAt]);

  // Value to be provided by the context
  const value: WalletAuthContextType = {
    isAuthenticated,
    walletAddress,
    isAuthenticating,
    recentlyDisconnected,
    sessionExpiresAt,
    checkAuthStatus,
    disconnect,
    refreshAuth,
  };

  return <WalletAuthContext.Provider value={value}>{children}</WalletAuthContext.Provider>;
}

export default WalletAuthProvider;
