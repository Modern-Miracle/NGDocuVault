'use client';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { clearSession } from '@/lib/auth/session';
import { useSIWE } from '@/components/providers/SIWEProvider';
import { useDisconnect } from 'wagmi';

/**
 * Main authentication hook that provides a standardized interface
 * to interact with the auth system
 */
export function useAuth() {
  const { state, dispatch } = useAuthContext();
  const navigate = useNavigate();
  const { signOut: siweSignOut } = useSIWE();
  const { disconnect: disconnectWallet } = useDisconnect();
  // Return a clean, standardized API without depending on useDidSiwe
  return useMemo(
    () => ({
      // State
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user,
      error: state.error,

      // DID specific properties
      did: state.user?.did || null,
      address: state.user?.address || null,
      roles: state.user?.roles || [],

      // Role helpers
      hasRole: (role: string) => state.user?.roles.includes(role) || false,
      isAdmin: state.user?.roles.includes('ADMIN') || false,
      isIssuer: state.user?.roles.includes('ISSUER') || false,
      isVerifier: state.user?.roles.includes('VERIFIER') || false,
      isHolder: state.user?.roles.includes('HOLDER') || false,

      // Actions
      signOut: async () => {
        await disconnectWallet();
        await siweSignOut();
        clearSession();
        dispatch({ type: 'AUTH_LOGOUT' });
      },

      signIn: () => {
        navigate('/auth/siwe');
      },

      navigateTo: (path: string) => {
        navigate(path);
      },
    }),
    [state, navigate, dispatch, siweSignOut]
  );
}
