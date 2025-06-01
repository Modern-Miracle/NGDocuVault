import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { useSIWE } from '../providers/SIWEProvider';
import { memo, useCallback, useMemo } from 'react';

interface SIWEButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const SIWEButton = memo(function SIWEButton({ onSuccess, className = '' }: SIWEButtonProps) {
  const { isConnected } = useAccount();
  const siweState = useSIWE();

  // Destructure and memoize values to prevent excessive rerenders
  const isSignedIn = useMemo(() => siweState.isSignedIn, [siweState.isSignedIn]);
  const isLoading = useMemo(() => siweState.isLoading, [siweState.isLoading]);

  const handleAuth = useCallback(async () => {
    if (!isConnected) return;

    if (isSignedIn) {
      await siweState.signOut();
    } else {
      await siweState.signIn();
      if (onSuccess) onSuccess();
    }
  }, [isConnected, isSignedIn, siweState.signIn, siweState.signOut, onSuccess]);

  const buttonContent = useMemo(() => {
    if (!isConnected) {
      return 'Connect Wallet';
    }

    if (isLoading) {
      return 'Loading...';
    }

    return isSignedIn ? 'Sign Out' : 'Sign In with Ethereum';
  }, [isConnected, isLoading, isSignedIn]);

  // Button class based on state
  const buttonClass = useMemo(() => {
    const baseClasses = `px-4 py-2 rounded-md font-medium transition-colors ${className}`;
    return isLoading
      ? `${baseClasses} bg-gray-400 cursor-not-allowed`
      : `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
  }, [isLoading, className]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected: connectionStatus, show }) => {
        return (
          <button onClick={connectionStatus ? handleAuth : show} disabled={isLoading} className={buttonClass}>
            {buttonContent}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
});
