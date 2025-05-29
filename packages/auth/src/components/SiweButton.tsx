
import React from 'react';
import { useSiweAuth } from '../hooks/useSiweAuth';
import { Button } from './Button';
import { Loader2 } from 'lucide-react';

export interface SiweButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function SiweButton({
  onSuccess,
  onError,
  className,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  children,
}: SiweButtonProps) {
  const { isAuthenticated, isSigningIn, signIn, signOut, isConnected } = useSiweAuth({
    onSuccess,
    onError,
  });

  if (isAuthenticated) {
    return (
      <Button
        onClick={signOut}
        variant={variant}
        size={size}
        className={fullWidth ? `w-full ${className}` : className}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={signIn}
      disabled={!isConnected || isSigningIn}
      variant={variant}
      size={size}
      className={fullWidth ? `w-full ${className}` : className}
    >
      {isSigningIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : !isConnected ? (
        'Connect Wallet First'
      ) : (
        children || 'Sign In with Ethereum'
      )}
    </Button>
  );
}