'use client';

import React, { useState } from 'react';
import { useSiweAuth } from '../hooks/use-siwe-auth';
import { WalletConnector } from './wallet-connector';
import { Loader2 } from 'lucide-react';
import { Button } from '@docu/ui/components/button';

interface SiweSignInProps {
  redirectTo?: string;
  className?: string;
  title?: string;
  description?: string;
}

export const SiweSignIn: React.FC<SiweSignInProps> = ({
  redirectTo,
  className = '',
  title = 'Sign In with Ethereum',
  description = 'Connect your wallet and sign a message to authenticate.',
}) => {
  const { isConnected, isConnecting, isAuthenticated, loading, error, signIn } = useSiweAuth({
    redirectToOnSignIn: redirectTo,
  });

  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setSignInError(null);
    try {
      const success = await signIn();
      if (!success) {
        setSignInError('Failed to authenticate. Please try again.');
      }
    } catch (err) {
      setSignInError('An error occurred during authentication.');
      console.error('Sign in error:', err);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 ${className}`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <div className="space-y-4">
        {!isConnected && (
          <div className="flex justify-center">
            <WalletConnector />
          </div>
        )}

        {isConnected && !isAuthenticated && (
          <Button onClick={handleSignIn} disabled={loading} className="w-full flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              'Sign Message to Authenticate'
            )}
          </Button>
        )}

        {isAuthenticated && (
          <div className="text-center py-2 text-green-600 dark:text-green-400">
            Successfully authenticated!
            {redirectTo && 'Redirecting...'}
          </div>
        )}

        {(error || signInError) && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md dark:text-red-400 dark:bg-red-900/30">
            {signInError || error?.message || 'An error occurred'}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default SiweSignIn;
