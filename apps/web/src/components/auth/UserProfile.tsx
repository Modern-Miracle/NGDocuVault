import { useDidSiwe, DidSiweState } from '@/hooks/use-did-siwe';
import { truncateAddress } from '@/lib/utils';
import { memo } from 'react';

interface UserProfileProps {
  className?: string;
}

const ProfileLoading = memo(({ className = '' }: { className?: string }) => (
  <div className={`${className} p-4 bg-gray-100 rounded-md`}>
    <div className="flex items-center space-x-2">
      <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
      <span>Loading profile information...</span>
    </div>
  </div>
));

const ProfileNotSignedIn = memo(({ className = '' }: { className?: string }) => (
  <div className={`${className} p-4 bg-gray-100 rounded-md`}>
    <div className="flex items-center space-x-2">
      <span className="text-red-500">●</span>
      <span>Not signed in</span>
    </div>
  </div>
));

const ProfileSignedInNotAuthorized = memo(
  ({ className = '', address }: { className?: string; address: string | null }) => (
    <div className={`${className} p-4 bg-gray-100 rounded-md`}>
      <div className="flex items-center space-x-2">
        <span className="text-yellow-500">●</span>
        <span>Signed in as {truncateAddress(address || '')}</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">No DID associated with this account</div>
    </div>
  )
);

const ProfileAuthorized = memo(
  ({
    className = '',
    address,
    did,
    roles,
  }: {
    className?: string;
    address: string | null;
    did: string | null | undefined;
    roles: string[];
  }) => (
    <div className={`${className} p-4 bg-gray-100 rounded-md`}>
      <div className="flex items-center space-x-2">
        <span className="text-green-500">●</span>
        <span>Signed in as {truncateAddress(address || '')}</span>
      </div>
      <div className="mt-2 text-sm">
        <div>
          <span className="font-medium">DID:</span> {truncateAddress(did || '')}
        </div>
        {roles.length > 0 && (
          <div className="mt-1">
            <span className="font-medium">Roles:</span> {roles.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
);

const selectIsSignedIn = (state: DidSiweState) => state.isSignedIn;

const selectIsAuthorized = (state: DidSiweState) => state.isAuthorized;
const selectIsLoading = (state: DidSiweState) => state.isLoading;
const selectAddress = (state: DidSiweState) => state.address;
const selectDid = (state: DidSiweState) => state.did;
const selectRoleNames = (state: DidSiweState) => state.roleNames;

export function UserProfile({ className = '' }: UserProfileProps) {
  const isSignedIn = useDidSiwe(selectIsSignedIn);

  console.log('UserProfile: isSignedIn', isSignedIn);
  const isAuthorized = useDidSiwe(selectIsAuthorized);
  console.log('UserProfile: isAuthorized', isAuthorized);
  const isLoading = useDidSiwe(selectIsLoading);
  const address = useDidSiwe(selectAddress);
  const did = useDidSiwe(selectDid);
  console.log('UserProfile: did', did);
  const roleNames = useDidSiwe(selectRoleNames);
  console.log('UserProfile: roleNames', roleNames);

  if (isLoading) {
    return <ProfileLoading className={className} />;
  }

  if (!isSignedIn) {
    return <ProfileNotSignedIn className={className} />;
  }

  if (isSignedIn && !isAuthorized) {
    return <ProfileSignedInNotAuthorized className={className} address={address} />;
  }

  return <ProfileAuthorized className={className} address={address} did={did} roles={roleNames} />;
}
