'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSiwe } from '../providers/siwe-provider';
import { useRouter } from 'next/navigation';

export interface UseSiweAuthOptions {
  redirectToOnSignIn?: string;
  redirectToOnSignOut?: string;
  refreshInterval?: number; // in milliseconds
}

export function useSiweAuth(options: UseSiweAuthOptions = {}) {
  const {
    redirectToOnSignIn = '/',
    redirectToOnSignOut = '/',
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const {
    address,
    isConnecting,
    isConnected,
    isAuthenticated,
    error,
    connectWallet,
    disconnectWallet,
    signInWithEthereum,
    signOut,
  } = useSiwe();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Convenience function to handle complete sign-in flow
  const signIn = useCallback(async () => {
    setLoading(true);

    try {
      // Connect wallet if not already connected
      if (!isConnected) {
        await connectWallet();
      }

      // Proceed with SIWE authentication
      const success = await signInWithEthereum();

      if (success && redirectToOnSignIn) {
        router.push(redirectToOnSignIn);
      }

      return success;
    } catch (err) {
      console.error('Failed to sign in with Ethereum:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isConnected, connectWallet, signInWithEthereum, router, redirectToOnSignIn]);

  // Handle sign out with redirect
  const handleSignOut = useCallback(async () => {
    setLoading(true);

    try {
      await signOut();

      if (redirectToOnSignOut) {
        router.push(redirectToOnSignOut);
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setLoading(false);
    }
  }, [signOut, router, redirectToOnSignOut]);

  // Periodically check authentication status for refresh
  useEffect(() => {
    if (!isAuthenticated || refreshInterval <= 0) return;

    //NOTE:
    const intervalId = setInterval(async () => {
      try {
        const status = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include',
        });

        // If session is no longer valid, sign out
        if (!status.ok) {
          disconnectWallet();
        }
      } catch (err) {
        console.error('Failed to refresh auth status:', err);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, refreshInterval, disconnectWallet]);

  return {
    address,
    isConnecting,
    isConnected,
    isAuthenticated,
    error,
    loading,
    signIn,
    signOut: handleSignOut,
    connectWallet,
    disconnectWallet,
  };
}

export default useSiweAuth;
