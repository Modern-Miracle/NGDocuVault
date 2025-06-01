'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useGetDid, useHasDidRole, useUserRoles } from './use-did-auth';

// Define the state interface for better type safety
export interface DidSiweState {
  isSignedIn: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  address: string | null;
  did: string | null | undefined;
  roles: string[];
  roleNames: string[];
  isVerifier: boolean | undefined;
  isIssuer: boolean | undefined;
  isAdmin: boolean | undefined;
  hasRoles: boolean;
  error: string | null;
}

/**
 * Hook that combines SIWE authentication with DID-based authorization
 * Provides information about the authenticated user's DID, roles, and capabilities
 */
export function useDidSiwe(): DidSiweState;
export function useDidSiwe<T>(selector: (state: DidSiweState) => T): T;
export function useDidSiwe<T>(selector?: (state: DidSiweState) => T): DidSiweState | T {
  // Use AuthContext directly instead of useAuth to avoid circular dependency
  const { state: authState } = useAuthContext();

  const isAuthenticated = authState.isAuthenticated;
  const address = authState.user?.address || null;
  const did = authState.user?.did || null;

  // Prevent multiple state updates for the same value
  const prevIsAuthRef = useRef(isAuthenticated);
  const prevDidRef = useRef(did);

  const [isAuthorized, setIsAuthorized] = useState(false);

  const isSignedIn = isAuthenticated;

  const ethAddress = address ? (address as `0x${string}`) : undefined;

  const { isLoading: didLoading } = useGetDid(ethAddress);

  // Only load roles when we actually have a DID to query
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles(did || '');
  const shouldCheckRoles = !!did && isSignedIn;

  const { data: isVerifier = false } = useHasDidRole(shouldCheckRoles ? did : '', 'VERIFIER_ROLE');
  const { data: isIssuer = false } = useHasDidRole(shouldCheckRoles ? did : '', 'ISSUER_ROLE');
  const { data: isAdmin = false } = useHasDidRole(shouldCheckRoles ? did : '', 'ADMIN_ROLE');
  console.log({ isVerifier, isIssuer, isAdmin });

  const roleNames = useMemo(() => {
    const names: string[] = [];
    if (isVerifier) names.push('Verifier');
    if (isIssuer) names.push('Issuer');
    if (isAdmin) names.push('Admin');
    return names;
  }, [isVerifier, isIssuer, isAdmin]);

  const hasRoles = userRoles.length > 0 || roleNames.length > 0;

  const isLoading = didLoading || rolesLoading || authState.isLoading;

  // Set authorization state
  useEffect(() => {
    // A user is authorized if they're signed in and have a DID (regardless of loading state)
    const newAuthState = isSignedIn && !!did;

    // Debug the auth state changes
    console.log('Auth state change:', {
      isSignedIn,
      did,
      currentIsAuthorized: isAuthorized,
      newAuthState,
    });

    // Only update state if it's different to avoid render loops
    if (newAuthState !== isAuthorized) {
      console.log('Updating isAuthorized state:', newAuthState);
      setIsAuthorized(newAuthState);
    }

    // Update prev refs to track changes
    prevDidRef.current = did;
    prevIsAuthRef.current = isSignedIn;
  }, [isSignedIn, did, isAuthorized]);

  const state = useMemo(
    () => ({
      isSignedIn,
      isAuthorized,
      isLoading,
      address,
      did,
      roles: userRoles,
      roleNames,
      isVerifier,
      isIssuer,
      isAdmin,
      hasRoles,
      error: authState.error,
    }),
    [
      isSignedIn,
      isAuthorized,
      isLoading,
      address,
      did,
      userRoles,
      roleNames,
      isVerifier,
      isIssuer,
      isAdmin,
      hasRoles,
      authState.error,
    ]
  );

  return useMemo(() => {
    if (!selector) {
      return state;
    }
    return selector(state);
  }, [selector, state]);
}
