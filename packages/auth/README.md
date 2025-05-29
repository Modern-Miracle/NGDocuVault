# @docu/auth

Framework-agnostic React authentication package for DocuVault with SIWE (Sign-In with Ethereum) support. This package provides reusable components, hooks, and utilities for integrating with the existing DocuVault API authentication system. Works with any React application (Next.js, Vite, CRA, etc.).

## Features

- 🔐 **SIWE Authentication**: Seamless wallet-based authentication
- ⚛️ **React Components**: Pre-built, customizable auth components
- 🪝 **React Hooks**: Easy-to-use authentication hooks
- 🛡️ **Protected Routes**: Built-in route protection
- 🎨 **UI Components**: Beautiful, accessible auth UI
- 🔄 **Auto Token Refresh**: Automatic token management
- 📦 **TypeScript**: Full type safety
- 🚀 **Framework Agnostic**: Works with any React setup

## Installation

```bash
pnpm add @docu/auth wagmi
```

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@docu/auth';
import { WagmiConfig } from 'wagmi';

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider apiUrl="http://localhost:3001/api">
        <YourApp />
      </AuthProvider>
    </WagmiConfig>
  );
}
```

### 2. Add Sign-In Button

```tsx
import { SiweButton } from '@docu/auth';

function Header() {
  return (
    <nav>
      <SiweButton 
        onSuccess={() => console.log('Signed in!')}
        onError={(error) => console.error('Sign in failed:', error)}
      />
    </nav>
  );
}
```

### 3. Use Authentication Hook

```tsx
import { useAuth } from '@docu/auth';

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome {user?.address}</h1>
      {user?.did && <p>DID: {user.did}</p>}
      {user?.role && <p>Role: {user.role}</p>}
    </div>
  );
}
```

### 4. Protect Routes

```tsx
import { ProtectedRoute } from '@docu/auth';

function PrivatePage() {
  return (
    <ProtectedRoute redirectTo="/login" requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

## Components

### SiweButton

A complete sign-in/sign-out button with loading states.

```tsx
<SiweButton
  variant="outline"
  size="lg"
  fullWidth
  onSuccess={() => router.push('/dashboard')}
/>
```

**Props:**
- `variant`: 'default' | 'outline' | 'ghost'
- `size`: 'sm' | 'default' | 'lg'
- `fullWidth`: boolean
- `onSuccess`: () => void
- `onError`: (error: Error) => void

### AuthStatus

Display current authentication status with user details.

```tsx
<AuthStatus showDetails={true} className="w-full" />
```

**Props:**
- `showDetails`: boolean - Show full details or compact view
- `className`: string - Additional CSS classes

### UserProfile

User dropdown menu with profile options and sign out.

```tsx
<UserProfile
  onProfileClick={() => console.log('Navigate to profile')}
  onSettingsClick={() => console.log('Navigate to settings')}
/>
```

### ProtectedRoute

Protect pages/components with authentication requirements.

```tsx
<ProtectedRoute 
  redirectTo="/login" 
  requiredRole="issuer"
  fallback={<LoadingSpinner />}
  onRedirect={(path) => navigate(path)} // Use your router's navigation
>
  <ProtectedContent />
</ProtectedRoute>
```

**Props:**
- `redirectTo`: string - Path to redirect unauthenticated users
- `requiredRole`: string - Required role to access content
- `fallback`: ReactNode - Loading component
- `onRedirect`: (path: string) => void - Navigation handler

## Hooks

### useAuth

Main authentication hook providing auth state and actions.

```tsx
const {
  // State
  isAuthenticated,
  isLoading,
  user,
  error,
  isRefreshing,
  
  // Actions
  generateChallenge,
  authenticate,
  signOut,
  refreshToken,
  checkAuth,
  
  // Utilities
  getAccessToken,
  hasRole,
} = useAuth({
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  refreshBeforeExpiry: 60, // 1 minute
});
```

### useSiweAuth

Specialized hook for SIWE authentication flow.

```tsx
const {
  // Wallet state
  address,
  chainId,
  isConnected,
  
  // Auth state
  isAuthenticated,
  isSigningIn,
  error,
  
  // Actions
  signIn,
  signOut,
} = useSiweAuth({
  onSuccess: () => console.log('Success!'),
  onError: (error) => console.error(error),
});
```

## Utilities

### withAuth HOC

Higher-order component for protecting components.

```tsx
const ProtectedComponent = withAuth(YourComponent, {
  redirectTo: '/login',
  requiredRole: 'admin',
});
```

### Authentication Helpers

```tsx
import { formatAddress, getAuthHeaders, createAuthenticatedFetch } from '@docu/auth';

// Format wallet address
const display = formatAddress('0x123...', 6); // "0x1234...5678"

// Get auth headers for API calls
const headers = getAuthHeaders(); // { Authorization: 'Bearer ...' }

// Create authenticated fetch
const authFetch = createAuthenticatedFetch('/api');
const data = await authFetch('/users').then(r => r.json());
```

## API Integration

The package is designed to work with the existing DocuVault API endpoints:

- `GET /api/auth/siwe/nonce` - Generate SIWE challenge
- `POST /api/auth/siwe/verify` - Verify signed message
- `POST /api/auth/token/refresh` - Refresh access token
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Sign out

## Advanced Usage

### Custom Authentication Flow

```tsx
import { AuthApi, authStore } from '@docu/auth';

const authApi = new AuthApi({ 
  baseUrl: 'https://api.docuvault.com' 
});

// Manual authentication
const challenge = await authApi.generateNonce(address, chainId);
const session = await authApi.verifySiweMessage(message, signature);

// Store tokens
authStore.setTokens({
  accessToken: session.auth.token,
  refreshToken: session.auth.refreshToken,
  expiresIn: 3600,
});
```

### Token Management

```tsx
import { authStore } from '@docu/auth';

// Check if authenticated
const isAuth = authStore.isAuthenticated();

// Get current token
const token = authStore.getAccessToken();

// Get time until expiry
const timeLeft = authStore.getTimeUntilExpiry();

// Clear authentication
authStore.clear();
```

### Protected API Calls

```tsx
import { createAuthenticatedFetch } from '@docu/auth';

const api = createAuthenticatedFetch(process.env.NEXT_PUBLIC_API_URL);

// All requests will include auth headers automatically
const response = await api('/protected-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data }),
});
```

## TypeScript

All components and hooks are fully typed. Key types:

```typescript
interface AuthUser {
  address: string;
  did?: string;
  role?: string;
  authenticated: boolean;
  authMethod?: 'siwe' | 'jwt';
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: Error | null;
}
```

## Security Considerations

- Tokens are stored in memory only (not localStorage)
- Automatic token refresh before expiry
- Secure session management
- CSRF protection via credentials: 'include'

## License

MIT