import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useSignMessage } from 'wagmi';
import * as siweApi from '@/api/siwe';
import { useRegisterDid } from '@/hooks/use-did-registry';
import { useRoles } from '@/hooks/use-did-auth';
import { useToast } from '@/hooks/use-toast';
import { generateKeyPair } from '@/lib/crypto';
import { useGetDid } from '@/hooks';
import { useAuthContext } from './AuthProvider';
import { setSession, clearSession } from '@/lib/auth/session';

interface SIWEContextValue {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
  isLoading: boolean;
  error: Error | null;
  address: string | null;
  did: string | null;
}

const SIWEContext = createContext<SIWEContextValue | null>(null);

export function SIWEProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  const { state, dispatch } = useAuthContext();

  // Store previous address to detect changes
  const prevAddressRef = useRef<string | undefined>(undefined);
  // Track if we've already updated roles in this session
  const [rolesUpdated, setRolesUpdated] = useState(false);

  // Only get roles when authenticated and we have an address
  const shouldGetRoles = state.isAuthenticated && !!address && !rolesUpdated;
  const roleInfo = useRoles(shouldGetRoles ? (address as `0x${string}`) : undefined);

  const didRegistryMutation = useRegisterDid();

  // Only get DID when we have an address
  const { data: fetchedDid } = useGetDid(address as `0x${string}`);

  const effectiveDid = useMemo(() => {
    return state.user?.did || fetchedDid;
  }, [state.user?.did, fetchedDid]);

  // Reset the role update flag when address changes
  useEffect(() => {
    if (prevAddressRef.current !== address) {
      setRolesUpdated(false);
      prevAddressRef.current = address;
    }
  }, [address]);

  // Update roles in the auth context
  useEffect(() => {
    // Only proceed if we have valid data and need to update
    if (shouldGetRoles && !roleInfo.isLoading && roleInfo.data) {
      // Convert role information to string array for our unified format
      const roles: string[] = [];
      if (roleInfo.data.isAdmin) roles.push('ADMIN');
      if (roleInfo.data.isIssuer) roles.push('ISSUER');
      if (roleInfo.data.isVerifier) roles.push('VERIFIER');
      if (roleInfo.data.isHolder) roles.push('HOLDER');

      // Update auth context with the latest role information
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: {
            address: address || null,
            did: effectiveDid || null,
            roles,
          },
        },
      });

      // Update session in cookies
      setSession({
        user: {
          address: address || null,
          did: effectiveDid || null,
          roles,
        },
      });

      // Mark roles as updated to prevent further updates
      setRolesUpdated(true);
    }
  }, [shouldGetRoles, roleInfo.isLoading, roleInfo.data, address, effectiveDid, dispatch]);

  // Check existing session on component mount
  useEffect(() => {
    // If there's no user in state but we have an address, try to restore from session
    if (!state.user && address && fetchedDid && !state.isLoading) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: {
            address,
            did: fetchedDid,
            roles: [], // Roles will be populated by the useRoles effect
          },
        },
      });
    }
  }, [address, fetchedDid, state.user, state.isLoading, dispatch]);

  const signIn = useCallback(async () => {
    try {
      if (!address) return;

      dispatch({ type: 'AUTH_START' });

      let did = effectiveDid;

      if (!did) {
        const keyPair = generateKeyPair();

        try {
          if (didRegistryMutation.mutateAsync) {
            await didRegistryMutation.mutateAsync({
              did: `did:docuvault:${address}`,
              document: JSON.stringify({
                name: 'User',
                email: 'user@example.com',
              }),
              publicKey: keyPair.publicKey,
            });
          }

          did = `did:docuvault:${address}`;
        } catch (error) {
          console.error('Error registering DID:', error);
          toast.error('Failed to register DID');
          dispatch({
            type: 'AUTH_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to register DID',
          });
          return;
        }
      }

      const nonce = await siweApi.fetchNonce(address);

      const domain = window.location.hostname;
      const origin = window.location.origin;

      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in with Ethereum to DocuVault',
        uri: origin,
        version: '1',
        chainId: 31337, // Hardhat network
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const verifyResult = await siweApi.verifySiweSignature(message, signature);

      if (verifyResult) {
        // Update auth context with user information
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              address,
              did: typeof did === 'string' ? did : String(did),
              roles: [], // Roles will be populated by the useRoles effect
            },
          },
        });

        // Store auth information in session
        setSession({
          user: {
            address,
            did: typeof did === 'string' ? did : String(did),
            roles: [],
          },
          message: JSON.stringify(message),
          signature,
        });

        // Reset role update flag after sign-in to fetch updated roles
        setRolesUpdated(false);

        toast.success('Successfully signed in with Ethereum');
      } else {
        throw new Error('Signature verification failed');
      }
    } catch (error) {
      console.error('Error during SIWE authentication:', error);
      toast.error('Authentication failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }, [address, effectiveDid, dispatch, signMessageAsync, didRegistryMutation.mutateAsync, toast]);

  const signOut = useCallback(async () => {
    try {
      // dispatch({ type: 'AUTH_START' });
      await siweApi.logout();

      // Clear auth state
      dispatch({ type: 'AUTH_LOGOUT' });

      // Clear session cookie
      clearSession();

      // Reset role update flag on sign out
      setRolesUpdated(false);

      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Error during sign out:', error);
    }
  }, [dispatch, toast]);

  const contextValue = useMemo<SIWEContextValue>(
    () => ({
      signIn,
      signOut,
      isSignedIn: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error ? new Error(state.error) : null,
      address: state.user?.address || null,
      did: state.user?.did || null,
    }),
    [signIn, signOut, state.isAuthenticated, state.isLoading, state.error, state.user?.address, state.user?.did]
  );

  return <SIWEContext.Provider value={contextValue}>{children}</SIWEContext.Provider>;
}

export const useSIWE = (): SIWEContextValue => {
  const context = useContext(SIWEContext);
  if (!context) {
    throw new Error('useSIWE must be used within a SIWEProvider');
  }
  return context;
};
