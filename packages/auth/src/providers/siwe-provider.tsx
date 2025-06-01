'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect, useDisconnect, useSignMessage, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { tokenStorage, csrfProtection, createApiClient } from '@docu/auth/lib';

// Define types for the SIWE context
interface SiweContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signInWithEthereum: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Create context with default values
const SiweContext = createContext<SiweContextType>({
  address: null,
  isConnecting: false,
  isConnected: false,
  isAuthenticated: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  signInWithEthereum: async () => false,
  signOut: async () => {},
});

// Custom hook for using the SIWE context
export const useSiwe = () => useContext(SiweContext);

interface SiweProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export const SiweProvider: React.FC<SiweProviderProps> = ({ children, apiUrl = '/api/auth' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use Wagmi hooks instead of direct ethers.js
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Create an API client for authentication requests
  const apiClient = createApiClient({
    baseUrl: apiUrl,
    onUnauthorized: () => {
      setIsAuthenticated(false);
    },
    onError: (error) => {
      setError(error);
    },
  });

  // Initialize on component mount
  useEffect(() => {
    const checkInitialAuthStatus = async () => {
      if (isConnected && address) {
        // Check if authenticated
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
      }
    };

    checkInitialAuthStatus();
  }, [isConnected, address]);

  //NOTE:
  // Check authentication status using our API client
  const checkAuthStatus = async (): Promise<boolean> => {
    // First check local token validity
    if (!tokenStorage.isTokenValid()) {
      return false;
    }

    try {
      // Verify with server
      const response = await apiClient.get<{ authenticated: boolean }>('/status');
      return response.ok && response.data?.authenticated === true;
    } catch (err) {
      console.error('Failed to check auth status:', err);
      return false;
    }
  };

  // Connect wallet using Wagmi
  const connectWallet = async (): Promise<void> => {
    try {
      setError(null);
      await connectAsync({ connector: injected() });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    }
  };

  // Disconnect wallet using Wagmi
  const disconnectWallet = useCallback(() => {
    disconnectAsync()
      .then(() => {
        setIsAuthenticated(false);
        tokenStorage.clearTokens();
      })
      .catch(console.error);
  }, [disconnectAsync]);

  // Sign in with Ethereum
  const signInWithEthereum = async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setError(new Error('Wallet not connected'));
      return false;
    }

    try {
      setError(null);

      // Step 1: Get a nonce from the server
      const nonceResponse = await apiClient.get<{ nonce: string }>('/nonce');

      if (!nonceResponse.ok || !nonceResponse.data?.nonce) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = nonceResponse.data;

      // Step 2: Create and sign the SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;

      const message = new SiweMessage({
        domain,
        address: address,
        statement: 'Sign in with Ethereum to DocuVault',
        uri: origin,
        version: '1',
        chainId: Number(chainId),
        nonce,
      });

      const preparedMessage = message.prepareMessage();
      const signatureValue = await signMessageAsync({ message: preparedMessage });

      // Get CSRF token for the request
      const csrfToken = csrfProtection.getToken();

      // Step 3: Verify the signature on the server
      const verifyResponse = await apiClient.post<{
        authenticated: boolean;
        expiresAt?: number | string;
      }>(
        '/verify',
        {
          message,
          signature: signatureValue,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        }
      );

      if (!verifyResponse.ok) {
        throw new Error(verifyResponse.error?.message || 'Verification failed');
      }

      // Set token expiry if provided
      if (verifyResponse.data?.expiresAt) {
        const expiryTime =
          typeof verifyResponse.data.expiresAt === 'string'
            ? new Date(verifyResponse.data.expiresAt).getTime()
            : verifyResponse.data.expiresAt;

        tokenStorage.setTokens({
          token: 'true', // Actual token is in HttpOnly cookie
          expiresAt: expiryTime,
        });
      } else {
        // Set a default expiry if none provided
        const defaultExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        tokenStorage.setTokens({
          token: 'true',
          expiresAt: defaultExpiry,
        });
      }

      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to authenticate'));
      return false;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await apiClient.post('/signout');
      tokenStorage.clearTokens();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Context value
  const contextValue: SiweContextType = {
    address: address ?? null,
    isConnecting: false, // The connect hook handles this state
    isConnected,
    isAuthenticated,
    error,
    connectWallet,
    disconnectWallet,
    signInWithEthereum,
    signOut,
  };

  return <SiweContext.Provider value={contextValue}>{children}</SiweContext.Provider>;
};

export default SiweProvider;
