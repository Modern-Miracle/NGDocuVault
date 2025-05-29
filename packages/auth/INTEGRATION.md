# Enhanced Auth Package Integration Guide

This document describes the enhanced @docu/auth package that combines SIWE authentication, DID management, and role-based access control into a comprehensive authentication solution.

## Key Improvements

### 1. Fixed Issues from Previous Integration
- ✅ **API Port Configuration**: Now correctly defaults to port 5000
- ✅ **Flow Control**: Simplified authentication flow with better error handling
- ✅ **State Management**: Consolidated auth providers to prevent conflicts
- ✅ **Token Management**: Enhanced token refresh with proper expiry handling
- ✅ **Error Handling**: Standardized error types and graceful fallbacks

### 2. Enhanced Architecture
- **Consolidated Providers**: Single EnhancedAuthProvider replaces multiple providers
- **Improved Storage**: Enhanced storage utilities with proper error handling
- **Standardized Actions**: Server actions with consistent API and error handling
- **Flow Components**: Reusable authentication flow components
- **Type Safety**: Comprehensive TypeScript types throughout

## Usage

### Basic Setup

```tsx
import { EnhancedAuthProvider } from '@docu/auth';

function App() {
  return (
    <EnhancedAuthProvider config={{ apiBaseUrl: 'http://localhost:5000/api/v1' }}>
      <YourApp />
    </EnhancedAuthProvider>
  );
}
```

### Enhanced Authentication Hook

```tsx
import { useEnhancedAuth } from '@docu/auth';

function MyComponent() {
  const {
    isAuthenticated,
    user,
    address,
    did,
    roles,
    isAdmin,
    isIssuer,
    signIn,
    signOut,
    generateChallenge,
    hasRole,
  } = useEnhancedAuth();

  // Your component logic
}
```

### Authentication Actions

```tsx
import { 
  generateChallenge, 
  authenticate, 
  refreshToken, 
  gracefulLogout 
} from '@docu/auth';

// Generate SIWE challenge
const challenge = await generateChallenge(address);

// Authenticate with signature
const authResult = await authenticate(address, signature);

// Refresh tokens
const refreshResult = await refreshToken(currentRefreshToken);

// Graceful logout (always succeeds locally)
await gracefulLogout(refreshToken);
```

### Storage Utilities

```tsx
import { AuthStorage, authStorage } from '@docu/auth';

// Use default storage
authStorage.setAuthToken(token, expiresIn);
const token = authStorage.getAuthToken();

// Create custom storage instance
const sessionAuth = new AuthStorage('custom_', true); // Use sessionStorage
```

### DID Utilities

```tsx
import { 
  generateKeyPair, 
  createDidDocument, 
  isValidDid, 
  extractAddressFromDid 
} from '@docu/auth';

// Generate cryptographic key pair
const { publicKey, privateKey } = generateKeyPair();

// Create DID document
const document = createDidDocument(address, publicKey, {
  name: 'User Name',
  email: 'user@example.com'
});

// Validate DID format
const isValid = isValidDid('did:docuvault:0x123...');

// Extract address from DID
const address = extractAddressFromDid('did:docuvault:0x123...');
```

## Migration from Legacy Implementation

### 1. Replace Multiple Providers

**Before:**
```tsx
<AuthProvider>
  <Web3Provider>
    <SIWEProvider>
      <App />
    </SIWEProvider>
  </Web3Provider>
</AuthProvider>
```

**After:**
```tsx
<EnhancedAuthProvider>
  <Web3Provider> {/* Keep Web3Provider for wallet functionality */}
    <App />
  </Web3Provider>
</EnhancedAuthProvider>
```

### 2. Update Hooks

**Before:**
```tsx
import { useAuth } from '@/hooks/use-auth';
import { useSIWE } from '@/components/providers/SIWEProvider';
```

**After:**
```tsx
import { useEnhancedAuth } from '@docu/auth';
```

### 3. Replace Manual Actions

**Before:**
```tsx
import { authenticate } from '@/components/user-flow/actions/authenticate';
import { generateChallenge } from '@/components/user-flow/actions/generateChallenge';
```

**After:**
```tsx
import { authenticate, generateChallenge } from '@docu/auth';
```

## Configuration Options

```tsx
interface AuthConfig {
  apiBaseUrl: string;
  endpoints: {
    challenge: string;
    authenticate: string;
    refresh: string;
    logout: string;
    session: string;
    profile: string;
    did: string;
  };
  tokenStorage: {
    prefix: string;
    accessTokenKey: string;
    refreshTokenKey: string;
    userKey: string;
  };
  refresh: {
    beforeExpiry: number; // seconds before expiry to refresh
    retryAttempts: number;
  };
}
```

## Error Handling

The package provides standardized error handling:

```tsx
import { AuthError } from '@docu/auth';

try {
  await authenticate(address, signature);
} catch (error) {
  if (error instanceof AuthError) {
    console.log('Auth error:', error.message);
    console.log('Error code:', error.code);
    console.log('Status code:', error.statusCode);
  }
}
```

## Features

### Role-Based Access Control
- Built-in role checking methods
- Support for multiple roles per user
- Convenience getters for common roles

### Token Management
- Automatic token refresh before expiry
- Secure storage with error handling
- Graceful fallbacks for storage failures

### DID Integration
- Complete DID document creation
- Cryptographic key pair generation
- DID validation utilities

### Flow Components
- Reusable authentication flows
- Step-by-step user onboarding
- Configurable flow behavior

This enhanced package provides a complete, production-ready authentication solution that addresses all the issues identified in the previous integration attempt.