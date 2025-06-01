import { JwtPayload } from 'jsonwebtoken';

/**
 * User roles in the system
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PRODUCER = 'producer',
  VERIFIER = 'verifier',
  DEFAULT_ADMIN_ROLE = 'DEFAULT_ADMIN_ROLE'
}

/**
 * JWT Token payload structure
 * Extends the standard JWT payload with our custom fields
 */
export interface TokenPayload extends JwtPayload {
  sub: string; // Ethereum address
  did: string; // Decentralized Identifier
  role: UserRole | string; // User role
  exp?: number; // Expiration time
  iat?: number; // Issued at time
}

/**
 * Authentication response structure
 */
export interface AuthResponse {
  did: string;
  address: string;
  role: UserRole | string;
  token: string;
  authenticated: boolean;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    address: string;
    role: UserRole | string;
    did?: string;
  };
}

/**
 * Session user structure
 * Used for storing user info in session
 */
export interface SessionUser {
  did: string;
  address: string;
  role: UserRole | string;
  authenticated: boolean;
  authMethod: 'jwt' | 'siwe';
}

/**
 * DID Document information
 */
export interface DidInfo {
  did: string;
  controller: string;
  active: boolean;
  created: Date;
  updated: Date;
  metadata?: Record<string, any>;
  credentials?: string[];
}

/**
 * DID Document information
 */
export interface DidDocument {
  subject: string;
  active: boolean;
  lastUpdated: Date;
  publicKey: string;
  document?: Record<string, any>;
}

/**
 * DID Document information
 */
export interface ExtendedDidDocument {
  did: string;
  subject: string;
  active: boolean;
  lastUpdated: Date;
  publicKey: string;
  metadata?: Record<string, any>;
  credentials?: string[];
  roles?: string[];
}

/**
 * SIWE Verification result
 */
export interface SiweVerificationResult {
  success: boolean;
  error?: string;
  address?: string;
  fields?: Record<string, any>;
}

/**
 * Authentication error types
 */
export enum AuthError {
  INVALID_CHALLENGE = 'Invalid challenge',
  INVALID_SIGNATURE = 'Invalid signature',
  DEACTIVATED_USER = 'User is deactivated',
  UNAUTHORIZED = 'Unauthorized',
  EXPIRED_TOKEN = 'Token has expired',
  INVALID_TOKEN = 'Invalid token',
  INVALID_REFRESH_TOKEN = 'Invalid refresh token',
  MISSING_TOKEN = 'Missing token',
  USER_NOT_FOUND = 'User not found'
}

/**
 * Refresh token payload structure
 */
export interface RefreshTokenPayload {
  userId: string;
  sub: string;
  tokenId: string;
  did?: string;
  role?: UserRole | string;
  jti?: string;
  exp?: number;
  iat?: number;
}

/**
 * Credential proof structure
 */
export interface CredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  proofValue?: string;
}

/**
 * Verifiable credential structure according to W3C spec
 */
export interface VerifiableCredential {
  '@context': string[] | string;
  id: string;
  type: string[] | string;
  issuer: string | { id: string; [key: string]: any };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id?: string;
    [key: string]: any;
  };
  proof: CredentialProof;
}

/**
 * Verification results for credential verification
 */
export interface VerificationResults {
  verified: boolean;
  error?: string;
  results?: any[];
}
