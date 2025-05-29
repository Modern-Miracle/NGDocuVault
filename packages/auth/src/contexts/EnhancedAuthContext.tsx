import React, { createContext, useContext, ReactNode, useEffect, useMemo, useReducer, useCallback } from 'react';
import { authStorage } from '../utils/storage';
import { authenticate, generateChallenge, refreshToken, gracefulLogout } from '../actions';
import { DEFAULT_CONFIG } from '../config';

export type UserRole =
  | 'DEFAULT_ADMIN_ROLE'
  | 'ADMIN_ROLE'
  | 'OPERATOR_ROLE'
  | 'ISSUER_ROLE'
  | 'VERIFIER_ROLE'
  | 'HOLDER_ROLE';

// Define role constants to match the smart contract
// Note: These would typically be computed using viem's keccak256 and toBytes
// For now, using placeholder hashes - replace with actual computed values
const ROLE_HASHES = {
  DEFAULT_ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' as const,
  ADMIN: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775' as const,
  CONSUMER: '0x1234567890000000000000000000000000000000000000000000000000000000' as const,
  PRODUCER: '0x2345678901000000000000000000000000000000000000000000000000000000' as const,
  PROVIDER: '0x3456789012000000000000000000000000000000000000000000000000000000' as const,
  OPERATOR: '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929' as const,
  ISSUER: '0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122' as const,
  VERIFIER: '0x12d0c7c2c026e4e24224170d970715aa230dbe3b8b97e96a4fc5b2a8569c2c76' as const,
  HOLDER: '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544991c6b5b7' as const,
} as const;

export interface User {
  address: string;
  did?: string;
  roles: string[];
  publicKey?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  tokens: {
    access?: string;
    refresh?: string;
    expiresAt?: number;
  };
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: { access: string; refresh: string; expiresAt: number } } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: { access: string; refresh?: string; expiresAt: number } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
  tokens: {},
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };
    
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        tokens: {
          access: action.payload.access,
          refresh: action.payload.refresh || state.tokens.refresh,
          expiresAt: action.payload.expiresAt,
        },
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: {},
        error: null,
      };
    
    default:
      return state;
  }
}

// Define the shape of the auth context
interface EnhancedAuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  
  // User properties (convenience)
  address: string | null;
  did: string | null;
  roles: string[];
  
  // Role checking methods
  hasRole: (role: UserRole | string) => boolean;
  hasAnyRole: (roles: (UserRole | string)[]) => boolean;
  hasAllRoles: (roles: (UserRole | string)[]) => boolean;
  
  // Role convenience getters
  isAdmin: boolean;
  isIssuer: boolean;
  isVerifier: boolean;
  isHolder: boolean;
  
  // Actions
  signIn: (address: string, signature: string) => Promise<void>;
  signOut: () => Promise<void>;
  generateAuthChallenge: (address: string) => Promise<string>;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<EnhancedAuthContextType | null>(null);

// Helper function to convert bytes32 role to UserRole type
function bytes32ToUserRole(roleHash: `0x${string}`): UserRole | null {
  switch (roleHash) {
    case ROLE_HASHES.DEFAULT_ADMIN:
      return 'DEFAULT_ADMIN_ROLE';
    case ROLE_HASHES.ADMIN:
      return 'ADMIN_ROLE';
    case ROLE_HASHES.OPERATOR:
      return 'OPERATOR_ROLE';
    case ROLE_HASHES.ISSUER:
      return 'ISSUER_ROLE';
    case ROLE_HASHES.VERIFIER:
      return 'VERIFIER_ROLE';
    case ROLE_HASHES.HOLDER:
      return 'HOLDER_ROLE';
    default:
      return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
  config?: Partial<typeof DEFAULT_CONFIG>;
}

export function EnhancedAuthProvider({ children, config }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Merge config with defaults
  const authConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authStorage.getUser<User>();
        const accessToken = authStorage.getAuthToken();
        const refreshTokenValue = authStorage.getRefreshToken();

        if (storedUser && accessToken) {
          const expiresAt = authStorage.getItem<number>('token_expires_at') || 0;
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedUser,
              tokens: {
                access: accessToken,
                refresh: refreshTokenValue || '',
                expiresAt,
              },
            },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh tokens before expiry
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens.expiresAt) return;

    const timeUntilExpiry = state.tokens.expiresAt - Date.now();
    const refreshThreshold = authConfig.refresh.beforeExpiry * 1000; // Convert to ms

    if (timeUntilExpiry <= refreshThreshold) {
      // Token is already expired or will expire soon, refresh immediately
      refreshTokens();
      return;
    }

    // Schedule refresh before expiry
    const refreshDelay = Math.max(0, timeUntilExpiry - refreshThreshold);
    const timeoutId = setTimeout(() => {
      refreshTokens();
    }, refreshDelay);

    return () => clearTimeout(timeoutId);
  }, [state.tokens.expiresAt, state.isAuthenticated, authConfig.refresh.beforeExpiry]);

  const generateAuthChallenge = useCallback(async (address: string): Promise<string> => {
    try {
      const response = await generateChallenge(address, authConfig.apiBaseUrl);
      return response.challenge;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate challenge';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  }, [authConfig.apiBaseUrl]);

  const signIn = useCallback(async (address: string, signature: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authenticate(address, signature, authConfig.apiBaseUrl);
      
      const user: User = {
        address: response.user.address,
        did: response.user.did,
        roles: response.user.roles,
      };

      const tokens = {
        access: response.accessToken,
        refresh: response.refreshToken,
        expiresAt: Date.now() + (response.expiresIn * 1000),
      };

      // Store in local storage
      authStorage.setAuthToken(response.accessToken, response.expiresIn);
      authStorage.setRefreshToken(response.refreshToken);
      authStorage.setUser(user);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  }, [authConfig.apiBaseUrl]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const currentRefreshToken = authStorage.getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshToken(currentRefreshToken!, authConfig.apiBaseUrl);
      
      const tokens = {
        access: response.accessToken,
        refresh: response.refreshToken,
        expiresAt: Date.now() + (response.expiresIn * 1000),
      };

      // Update storage
      authStorage.setAuthToken(response.accessToken, response.expiresIn);
      if (response.refreshToken) {
        authStorage.setRefreshToken(response.refreshToken);
      }
      authStorage.setUser(response.user);

      dispatch({
        type: 'TOKEN_REFRESHED',
        payload: tokens,
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      authStorage.clear();
      return false;
    }
  }, [authConfig.apiBaseUrl]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const refreshTokenValue = authStorage.getRefreshToken();
      await gracefulLogout(refreshTokenValue || undefined, authConfig.apiBaseUrl);
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
      authStorage.clear();
    }
  }, [authConfig.apiBaseUrl]);

  // Role checking methods
  const hasRole = useCallback((role: UserRole | string): boolean => {
    if (!state.user?.roles) return false;
    return state.user.roles.includes(role);
  }, [state.user?.roles]);

  const hasAnyRole = useCallback((roles: (UserRole | string)[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const hasAllRoles = useCallback((roles: (UserRole | string)[]): boolean => {
    return roles.every(role => hasRole(role));
  }, [hasRole]);

  // Convenience role getters
  const isAdmin = useMemo(() => hasRole('ADMIN') || hasRole('DEFAULT_ADMIN_ROLE'), [hasRole]);
  const isIssuer = useMemo(() => hasRole('ISSUER'), [hasRole]);
  const isVerifier = useMemo(() => hasRole('VERIFIER'), [hasRole]);
  const isHolder = useMemo(() => hasRole('HOLDER'), [hasRole]);

  const contextValue: EnhancedAuthContextType = {
    // State
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
    
    // User properties
    address: state.user?.address || null,
    did: state.user?.did || null,
    roles: state.user?.roles || [],
    
    // Role methods
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Role convenience getters
    isAdmin,
    isIssuer,
    isVerifier,
    isHolder,
    
    // Actions
    signIn,
    signOut,
    generateAuthChallenge,
    refreshTokens,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useEnhancedAuth(): EnhancedAuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}