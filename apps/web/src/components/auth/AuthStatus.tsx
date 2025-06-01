import { useAccount } from 'wagmi';
import { useSIWE } from '../providers/SIWEProvider';
import { truncateAddress } from '@/lib/utils';
import { memo, useMemo } from 'react';

interface AuthStatusProps {
  className?: string;
}

// Separated sub-components for better memoization
const NotConnected = memo(({ className }: { className: string }) => (
  <div className={`${className} p-4 bg-gray-100 rounded-md`}>
    <p className="text-gray-600">Not connected to wallet</p>
  </div>
));

const NotAuthenticated = memo(({ className, address }: { className: string; address: string | undefined }) => (
  <div className={`${className} p-4 bg-yellow-50 rounded-md`}>
    <p className="text-yellow-700">Connected to wallet {truncateAddress(address || '')} but not authenticated</p>
  </div>
));

const Authenticated = memo(
  ({
    className,
    address,
    did,
    isLoading,
  }: {
    className: string;
    address: string | null;
    did: string | null;
    isLoading: boolean;
  }) => {
    return (
      <div className={`${className} p-4 bg-muted rounded-md`}>
        <p className="text-green-700">Authenticated as {truncateAddress(address || '')}</p>
        {isLoading ? (
          <p className="text-muted-foreground text-sm mt-1">Loading DID...</p>
        ) : did ? (
          <p className="text-muted-foreground text-sm mt-1">DID: {truncateAddress(did, 10, 10)}</p>
        ) : (
          <p className="text-destructive text-sm mt-1">No DID found</p>
        )}
      </div>
    );
  }
);

export const AuthStatus = memo(function AuthStatus({ className = '' }: AuthStatusProps) {
  const { address, isConnected } = useAccount();

  const siweState = useSIWE();
  const isSignedIn = useMemo(() => siweState.isSignedIn, [siweState.isSignedIn]);
  const siweAddress = useMemo(() => siweState.address, [siweState.address]);
  const did = useMemo(() => siweState.did, [siweState.did]);
  const isLoading = useMemo(() => siweState.isLoading, [siweState.isLoading]);

  if (!isConnected) {
    return <NotConnected className={className} />;
  }

  if (!isSignedIn) {
    return <NotAuthenticated className={className} address={address} />;
  }

  return <Authenticated className={className} address={siweAddress} did={did} isLoading={isLoading} />;
});
