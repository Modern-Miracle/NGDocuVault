# @docu/auth Usage Examples

## Basic Integration

### 1. Setting up in React App (Works with Next.js, Vite, CRA, etc.)

```tsx
// App.tsx or providers.tsx
import { AuthProvider } from '@docu/auth';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './config/wagmi';

export function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider 
        apiUrl="http://localhost:3001/api"
        autoConnect={true}
        onAuthStateChange={(isAuthenticated, user) => {
          console.log('Auth state changed:', { isAuthenticated, user });
        }}
      >
        <YourApp />
      </AuthProvider>
    </WagmiConfig>
  );
}
```

### 2. Navigation with Auth

```tsx
// components/Navigation.tsx
import { SiweButton, UserProfile, useAuth } from '@docu/auth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom'; // or your router

export function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate(); // or your router's navigation

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Logo />
        {isAuthenticated && (
          <NavLinks role={user?.role} />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <ConnectButton />
        {isAuthenticated ? (
          <UserProfile 
            onProfileClick={() => navigate('/profile')}
            onSettingsClick={() => navigate('/settings')}
          />
        ) : (
          <SiweButton />
        )}
      </div>
    </nav>
  );
}
```

## Advanced Examples

### Custom Sign-In Flow

```tsx
// components/CustomSignIn.tsx
import { useSiweAuth } from '@docu/auth';
import { toast } from 'sonner';

export function CustomSignIn() {
  const { 
    signIn, 
    isSigningIn, 
    error, 
    address, 
    isConnected 
  } = useSiweAuth({
    onSuccess: () => {
      toast.success('Successfully signed in!');
      navigate('/dashboard'); // Use your router
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <p>Please connect your wallet first</p>
      ) : (
        <>
          <p>Sign in with address: {address}</p>
          <button
            onClick={signIn}
            disabled={isSigningIn}
            className="btn-primary"
          >
            {isSigningIn ? 'Signing in...' : 'Sign In'}
          </button>
          {error && (
            <p className="text-red-500">{error.message}</p>
          )}
        </>
      )}
    </div>
  );
}
```

### Protected Dashboard

```tsx
// pages/Dashboard.tsx
import { ProtectedRoute, AuthStatus } from '@docu/auth';
import { useNavigate } from 'react-router-dom'; // or your router

export function DashboardPage() {
  const navigate = useNavigate();
  
  return (
    <ProtectedRoute 
      redirectTo="/login"
      onRedirect={(path) => navigate(path)}
    >
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AuthStatus showDetails />
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, getAccessToken } = useAuth();
  
  const fetchUserData = async () => {
    const token = getAccessToken();
    const response = await fetch('/api/user/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  };

  // ... rest of component
}
```

### Role-Based Access

```tsx
// components/AdminPanel.tsx
import { withAuth, useAuth } from '@docu/auth';

function AdminPanelComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user?.address}</p>
      {/* Admin content */}
    </div>
  );
}

// Protect with HOC
export const AdminPanel = withAuth(AdminPanelComponent, {
  redirectTo: '/unauthorized',
  requiredRole: 'admin',
});

// Or use in-component protection
export function AdminSection() {
  const { hasRole } = useAuth();
  
  if (!hasRole('admin')) {
    return <div>You need admin access to view this section</div>;
  }
  
  return <AdminPanelComponent />;
}
```

### Auto-Refreshing Session

```tsx
// components/SessionManager.tsx
import { useAuth } from '@docu/auth';
import { useEffect } from 'react';

export function SessionManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRefreshing } = useAuth({
    refreshInterval: 4 * 60 * 1000, // 4 minutes
    refreshBeforeExpiry: 120, // 2 minutes before expiry
  });

  useEffect(() => {
    if (isRefreshing) {
      console.log('Refreshing authentication token...');
    }
  }, [isRefreshing]);

  return (
    <>
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-1 text-center text-sm">
          Refreshing session...
        </div>
      )}
      {children}
    </>
  );
}
```

### Custom API Integration

```tsx
// hooks/useDocuments.ts
import { createAuthenticatedFetch, useAuth } from '@docu/auth';
import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/api'; // or from env/config
const api = createAuthenticatedFetch(API_URL);

export function useDocuments() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api('/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: isAuthenticated,
  });
}
```

### Using with Express/Node.js Backend

```javascript
// server/middleware/auth.js
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify with your auth service
    const response = await fetch('http://localhost:3001/api/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }

    req.user = await response.json();
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Use in routes
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ data: 'Protected data', user: req.user });
});
```

## Testing

### Mocking Authentication in Tests

```tsx
// __tests__/utils/auth-mock.tsx
import { AuthProvider } from '@docu/auth';
import { ReactNode } from 'react';

export const mockUser = {
  address: '0x1234567890123456789012345678901234567890',
  did: 'did:docuvault:0x1234567890123456789012345678901234567890',
  role: 'user',
  authenticated: true,
  authMethod: 'siwe' as const,
};

export function MockAuthProvider({ 
  children,
  authenticated = true 
}: { 
  children: ReactNode;
  authenticated?: boolean;
}) {
  return (
    <AuthProvider apiUrl="http://localhost:3001">
      {children}
    </AuthProvider>
  );
}

// In your tests
import { render } from '@testing-library/react';
import { MockAuthProvider } from './utils/auth-mock';

test('renders authenticated content', () => {
  const { getByText } = render(
    <MockAuthProvider authenticated={true}>
      <YourComponent />
    </MockAuthProvider>
  );
  
  expect(getByText('Welcome')).toBeInTheDocument();
});
```