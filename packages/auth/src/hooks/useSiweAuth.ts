
import { useCallback, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useAuth } from './useAuth';

export interface UseSiweAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSiweAuth(options: UseSiweAuthOptions = {}) {
  const { address, chain, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { generateChallenge, authenticate, signOut, isAuthenticated } = useAuth();
  
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(async () => {
    if (!address || !chain) {
      const error = new Error('Wallet not connected');
      setError(error);
      options.onError?.(error);
      return false;
    }

    try {
      setIsSigningIn(true);
      setError(null);

      // Generate challenge from API
      const challenge = await generateChallenge(address, chain.id);

      // Sign message with wallet
      const signature = await signMessageAsync({ 
        message: challenge.message 
      });

      // Authenticate with API
      await authenticate(challenge.message, signature);

      options.onSuccess?.();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      options.onError?.(error);
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, [address, chain, generateChallenge, signMessageAsync, authenticate, options]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [signOut]);

  return {
    // Wallet state
    address,
    chainId: chain?.id,
    isConnected,

    // Auth state
    isAuthenticated,
    isSigningIn,
    error,

    // Actions
    signIn,
    signOut: handleSignOut,
  };
}