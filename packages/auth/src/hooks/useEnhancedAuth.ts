import { useCallback, useMemo } from 'react';
import { useEnhancedAuth as useEnhancedAuthContext } from '../contexts/EnhancedAuthContext';
import { generateKeyPair, createDidDocument as createDidDocumentUtil } from '../utils/crypto';

export interface UseEnhancedAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  error: string | null;
  
  // User properties
  address: string | null;
  did: string | null;
  roles: string[];
  
  // Role checking
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  
  // Convenience role checks
  isAdmin: boolean;
  isIssuer: boolean;
  isVerifier: boolean;
  isHolder: boolean;
  
  // Authentication actions
  signIn: (address: string, signature: string) => Promise<void>;
  signOut: () => Promise<void>;
  generateChallenge: (address: string) => Promise<string>;
  refreshTokens: () => Promise<boolean>;
  
  // DID creation utilities
  generateKeyPair: () => { publicKey: string; privateKey: string };
  createDidDocument: (address: string, publicKey: string, metadata?: any) => string;
}

/**
 * Enhanced authentication hook that provides all authentication functionality
 * including SIWE authentication, DID management, and role-based access control
 */
export function useEnhancedAuth(): UseEnhancedAuthReturn {
  const auth = useEnhancedAuthContext();
  
  // DID creation utilities
  const generateKeyPairUtil = useCallback(() => {
    return generateKeyPair();
  }, []);
  
  const createDidDocument = useCallback((
    address: string, 
    publicKey: string, 
    metadata: any = {}
  ): string => {
    return createDidDocumentUtil(address, publicKey, metadata);
  }, []);
  
  return useMemo(() => ({
    // State from auth context
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error,
    
    // User properties
    address: auth.address,
    did: auth.did,
    roles: auth.roles,
    
    // Role checking methods
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    hasAllRoles: auth.hasAllRoles,
    
    // Convenience role checks
    isAdmin: auth.isAdmin,
    isIssuer: auth.isIssuer,
    isVerifier: auth.isVerifier,
    isHolder: auth.isHolder,
    
    // Authentication actions
    signIn: auth.signIn,
    signOut: auth.signOut,
    generateChallenge: auth.generateAuthChallenge,
    refreshTokens: auth.refreshTokens,
    
    // DID utilities
    generateKeyPair: generateKeyPairUtil,
    createDidDocument,
  }), [auth, generateKeyPairUtil, createDidDocument]);
}