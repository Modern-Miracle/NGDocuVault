# Authentication Flow

## Overview

The Docu application implements a Web3-native authentication system using Sign-In with Ethereum (SIWE). This provides secure, decentralized authentication without traditional passwords.

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Wallet Connection                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  MetaMask   │  │WalletConnect│  │  Coinbase  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    SIWE Message                              │
│              Sign message to authenticate                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Verification                         │
│         Verify signature and create session                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authenticated State                        │
│              Access to protected routes                       │
└─────────────────────────────────────────────────────────────┘
```

## Wallet Connection

### ConnectKit Integration

```typescript
// config/wagmi.ts
import { getDefaultConfig } from 'connectkit';
import { createConfig } from 'wagmi';

export const config = createConfig(
  getDefaultConfig({
    appName: 'Docu Vault',
    appDescription: 'Decentralized Document Verification',
    appIcon: '/logo.png',
    walletConnectProjectId: process.env.VITE_WALLETCONNECT_PROJECT_ID,
    chains: [mainnet, sepolia, localhost],
  })
);
```

### Wallet Connection Component

```typescript
// components/WalletConnect.tsx
import { ConnectKitButton } from 'connectkit';

export function WalletConnect() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <Button onClick={show} variant="outline">
            {isConnected ? ensName ?? truncatedAddress : 'Connect Wallet'}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
```

### Supported Wallets

1. **MetaMask** - Browser extension and mobile
2. **WalletConnect** - Mobile wallet protocol
3. **Coinbase Wallet** - Coinbase's wallet
4. **Rainbow** - Mobile-first wallet
5. **Argent** - Smart contract wallet
6. **Trust Wallet** - Multi-chain wallet

## SIWE Authentication

### Authentication Flow Steps

#### 1. Request Nonce

```typescript
// api/auth.ts
export async function requestNonce(address: string): Promise<string> {
  const response = await apiClient.get(`/auth/siwe/nonce?address=${address}`);
  return response.data.nonce;
}
```

#### 2. Create SIWE Message

```typescript
// utils/siwe.ts
import { SiweMessage } from 'siwe';

export function createSiweMessage(address: string, nonce: string) {
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: 'Sign in to Docu Vault',
    uri: window.location.origin,
    version: '1',
    chainId: 1,
    nonce,
    issuedAt: new Date().toISOString(),
  });
  
  return message.prepareMessage();
}
```

#### 3. Sign Message

```typescript
// hooks/useSignIn.ts
export function useSignIn() {
  const { address, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const signIn = async () => {
    if (!address) throw new Error('No wallet connected');
    
    // Get nonce
    const nonce = await requestNonce(address);
    
    // Create message
    const message = createSiweMessage(address, nonce);
    
    // Sign message
    const signature = await signMessageAsync({ message });
    
    // Verify with backend
    const response = await verifySignature({
      message,
      signature,
      address,
    });
    
    return response;
  };
  
  return { signIn };
}
```

#### 4. Verify Signature

```typescript
// api/auth.ts
export async function verifySignature(data: {
  message: string;
  signature: string;
  address: string;
}) {
  const response = await apiClient.post('/auth/siwe/verify', data);
  
  if (response.data.accessToken) {
    // Store tokens
    tokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }
  
  return response.data;
}
```

## Session Management

### Token Storage

```typescript
// lib/tokenManager.ts
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    // Store refresh token securely
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
  
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  getRefreshToken(): string | null {
    return this.refreshToken || localStorage.getItem('refreshToken');
  }
  
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }
}

export const tokenManager = new TokenManager();
```

### Token Refresh

```typescript
// api/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await apiClient.post('/auth/siwe/refresh', {
          refreshToken,
        });
        
        tokenManager.setTokens(response.data);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Authentication Provider

### Provider Implementation

```typescript
// providers/AuthProvider.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);
  
  // Handle wallet connection changes
  useEffect(() => {
    if (!isConnected && user) {
      signOut();
    }
  }, [isConnected, user]);
  
  const checkSession = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const response = await apiClient.get('/auth/siwe/session');
      setUser(response.data.user);
    } catch (error) {
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async () => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      const nonce = await requestNonce(address);
      const message = createSiweMessage(address, nonce);
      const signature = await signMessageAsync({ message });
      
      const response = await verifySignature({
        message,
        signature,
        address,
      });
      
      setUser(response.user);
      
      // Check for DID
      if (!response.user.did) {
        // Redirect to DID creation
        navigate('/onboarding/create-did');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      await apiClient.post('/auth/siwe/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      disconnect();
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

## Protected Routes

### Route Protection

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
```

### Role-Based Protection

```typescript
// components/RoleProtectedRoute.tsx
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleProtectedRoute({
  children,
  requiredRoles,
  fallback,
}: RoleProtectedRouteProps) {
  const { user } = useAuth();
  
  const hasRequiredRole = user?.roles.some((role) =>
    requiredRoles.includes(role)
  );
  
  if (!hasRequiredRole) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

## DID Integration

### DID Creation Flow

```typescript
// components/CreateDIDFlow.tsx
export function CreateDIDFlow() {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const { mutate: createDID } = useCreateDID();
  
  const handleCreateDID = async () => {
    if (!address) return;
    
    try {
      await createDID({
        address,
        publicKey: await generatePublicKey(),
      });
      
      setStep(2); // Move to success step
    } catch (error) {
      console.error('DID creation failed:', error);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your DID</CardTitle>
            <CardDescription>
              A DID (Decentralized Identifier) is required to use Docu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateDID} className="w-full">
              Create DID
            </Button>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>DID Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Error Handling

### Authentication Errors

```typescript
// utils/authErrors.ts
export enum AuthErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  SIGNATURE_REJECTED = 'SIGNATURE_REJECTED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('User rejected')) {
      return 'You need to sign the message to authenticate';
    }
    
    if (error.message.includes('No wallet')) {
      return 'Please connect your wallet first';
    }
  }
  
  return 'Authentication failed. Please try again.';
}
```

### Error Boundary

```typescript
// components/AuthErrorBoundary.tsx
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Authentication Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {getAuthErrorMessage(error)}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Security Considerations

### Best Practices

1. **Message Validation**
   - Verify domain matches
   - Check nonce expiration
   - Validate chain ID

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Refresh tokens with rotation
   - Secure storage (httpOnly cookies in production)

3. **Session Management**
   - Automatic token refresh
   - Session timeout handling
   - Concurrent session detection

4. **Network Security**
   - HTTPS only in production
   - CORS configuration
   - Rate limiting

### Security Headers

```typescript
// middleware/security.ts
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline';"
  );
  next();
}
```

## Testing Authentication

### Unit Tests

```typescript
// __tests__/auth/useSignIn.test.ts
describe('useSignIn', () => {
  it('should sign in successfully', async () => {
    const { result } = renderHook(() => useSignIn(), {
      wrapper: TestProviders,
    });
    
    // Mock wallet connection
    mockAccount({ address: '0x123...', isConnected: true });
    
    // Mock API responses
    mockRequestNonce('test-nonce');
    mockVerifySignature({ accessToken: 'token', user: mockUser() });
    
    // Execute sign in
    await act(async () => {
      await result.current.signIn();
    });
    
    expect(result.current.user).toEqual(mockUser());
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### E2E Tests

```typescript
// e2e/auth.spec.ts
test('complete authentication flow', async ({ page }) => {
  // Navigate to app
  await page.goto('/');
  
  // Connect wallet
  await page.click('button:has-text("Connect Wallet")');
  await page.click('button:has-text("MetaMask")');
  
  // Handle MetaMask popup
  const metamaskPage = await page.waitForEvent('popup');
  await metamaskPage.click('button:has-text("Connect")');
  
  // Sign message
  await page.click('button:has-text("Sign In")');
  await metamaskPage.click('button:has-text("Sign")');
  
  // Verify authenticated
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure wallet extension is installed
   - Check network compatibility
   - Clear wallet cache

2. **Signature Rejected**
   - User must approve signature
   - Check message format
   - Verify nonce validity

3. **Session Expired**
   - Automatic refresh should handle
   - Manual re-authentication if needed
   - Check token expiration settings

4. **Network Mismatch**
   - Ensure correct chain selected
   - Auto-switch chain if supported
   - Display network warning

[Placeholder: Authentication Flow Diagram - Visual representation of the complete authentication process from wallet connection to authenticated state]

[Placeholder: SIWE Message Example - Screenshot showing the SIWE message that users sign]

[Placeholder: Wallet Connection Modal - Screenshot of the wallet selection interface]