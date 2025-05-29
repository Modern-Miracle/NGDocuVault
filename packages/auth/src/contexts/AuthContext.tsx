
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, AuthActions, AuthUser } from '../types/client';
import { AuthApi } from '../api/auth-api';
import { authStore } from '../store/auth-store';

interface AuthContextValue extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Action types
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; tokens: any } }
  | { type: 'AUTH_ERROR'; payload: Error }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: any };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null,
      };
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        tokens: action.payload,
      };
    default:
      return state;
  }
}

export interface AuthProviderProps {
  children: React.ReactNode;
  apiUrl: string;
  autoConnect?: boolean;
  onAuthStateChange?: (isAuthenticated: boolean, user: AuthUser | null) => void;
}

export function AuthProvider({
  children,
  apiUrl,
  autoConnect = true,
  onAuthStateChange,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    tokens: null,
    error: null,
  });

  const authApi = React.useMemo(() => new AuthApi({ baseUrl: apiUrl }), [apiUrl]);

  // Check authentication status on mount
  useEffect(() => {
    if (autoConnect) {
      checkAuth();
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [autoConnect]);

  // Notify auth state changes
  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(state.isAuthenticated, state.user);
    }
  }, [state.isAuthenticated, state.user, onAuthStateChange]);

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      if (!authStore.isAuthenticated()) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      const token = authStore.getAccessToken();
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      const session = await authApi.getSession(token);
      if (session.authenticated) {
        const user: AuthUser = {
          address: session.user.address,
          did: session.user.did,
          role: session.user.role,
          authenticated: true,
        };

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens: { accessToken: token } },
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [authApi]);

  const generateChallenge = useCallback(
    async (address: string, chainId: number) => {
      try {
        return await authApi.generateNonce(address, chainId);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to generate challenge');
        dispatch({ type: 'AUTH_ERROR', payload: err });
        throw err;
      }
    },
    [authApi]
  );

  const authenticate = useCallback(
    async (message: string, signature: string) => {
      try {
        dispatch({ type: 'AUTH_LOADING' });

        const response = await authApi.verifySiweMessage(message, signature);
        
        // Store tokens
        if (response.session?.accessToken) {
          const tokens = {
            accessToken: response.session.accessToken,
            refreshToken: response.session.refreshToken,
            expiresIn: response.session.expiresIn || 3600,
          };
          authStore.setTokens(tokens);
        } else if (response.auth?.token) {
          const tokens = {
            accessToken: response.auth.token,
            refreshToken: response.auth.refreshToken,
            expiresIn: response.auth.expiresIn || 3600,
          };
          authStore.setTokens(tokens);
        }

        const user: AuthUser = {
          address: response.address || response.auth?.address,
          did: response.auth?.did,
          role: response.auth?.role,
          authenticated: true,
          authMethod: 'siwe',
        };

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens: state.tokens },
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Authentication failed');
        dispatch({ type: 'AUTH_ERROR', payload: err });
        throw err;
      }
    },
    [authApi, state.tokens]
  );

  const refreshToken = useCallback(async () => {
    try {
      const currentRefreshToken = authStore.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const tokens = await authApi.refreshToken(currentRefreshToken);
      authStore.setTokens(tokens);
      
      dispatch({ type: 'TOKEN_REFRESHED', payload: tokens });
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      authStore.clear();
      throw error;
    }
  }, [authApi]);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = authStore.getRefreshToken();
      await authApi.logout(refreshToken || undefined);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStore.clear();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [authApi]);

  const value: AuthContextValue = {
    ...state,
    generateChallenge,
    authenticate,
    refreshToken,
    signOut,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}