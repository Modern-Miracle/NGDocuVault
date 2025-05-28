# Frontend Architecture

## Overview

The Docu frontend follows a modern React architecture with clear separation of concerns, type safety, and scalable patterns. The application is built with performance, maintainability, and developer experience in mind.

## Directory Structure

```
apps/web/
├── src/
│   ├── api/                 # API client and service layer
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── documents/      # Document management components
│   │   ├── layouts/        # Layout components
│   │   ├── providers/      # Context providers
│   │   ├── ui/            # Base UI components
│   │   └── user-flow/     # User onboarding flows
│   ├── config/             # Configuration files
│   ├── constants/          # Application constants
│   ├── helpers/            # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # External library wrappers
│   ├── pages/              # Page components
│   ├── services/           # Business logic services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                  # Static public assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Component Architecture

### Component Hierarchy

```
App
├── Providers
│   ├── Web3Provider
│   ├── AuthProvider
│   ├── SIWEProvider
│   └── QueryClientProvider
└── Router
    └── Routes
        └── Layout
            ├── Header
            ├── Sidebar
            └── Page Components
                ├── Dashboard
                ├── Documents
                ├── Profile
                └── ...
```

### Component Categories

#### 1. **Page Components** (`/pages`)
Top-level components representing full pages/routes.

```typescript
// Example: Dashboard.tsx
export default function Dashboard() {
  const { user } = useAuth();
  const roleComponent = getRoleBasedDashboard(user?.role);
  
  return (
    <DashboardLayout>
      {roleComponent}
    </DashboardLayout>
  );
}
```

#### 2. **Feature Components** (`/components`)
Complex components implementing specific features.

```typescript
// Example: DocumentCard.tsx
interface DocumentCardProps {
  document: Document;
  onVerify?: () => void;
  onShare?: () => void;
}

export function DocumentCard({ document, onVerify, onShare }: DocumentCardProps) {
  // Component implementation
}
```

#### 3. **UI Components** (`/components/ui`)
Reusable, presentational components.

```typescript
// Example: Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    // Component implementation
  }
);
```

## State Management Architecture

### 1. **Global State (Zustand)**

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
}));
```

### 2. **Server State (React Query)**

```typescript
// hooks/useDocuments.ts
export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
```

### 3. **Local State (React)**

```typescript
// Component local state
function DocumentForm() {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    file: null,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form handling logic
}
```

## Data Flow Architecture

### Unidirectional Data Flow

```
User Action → Event Handler → State Update → UI Re-render
     ↑                                              ↓
     └──────────────── Side Effects ←──────────────┘
```

### API Integration Pattern

```typescript
// api/client.ts
class APIClient {
  private baseURL: string;
  private token: string | null;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.token = null;
  }
  
  setAuthToken(token: string) {
    this.token = token;
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
}

export const apiClient = new APIClient();
```

### Web3 Integration Pattern

```typescript
// hooks/useContract.ts
export function useDocuVaultContract() {
  const { data: signer } = useSigner();
  
  return useMemo(() => {
    if (!signer) return null;
    
    return new ethers.Contract(
      DOCU_VAULT_ADDRESS,
      DocuVaultABI,
      signer
    );
  }, [signer]);
}

// Usage in component
function RegisterDocument() {
  const contract = useDocuVaultContract();
  const { writeAsync } = useContractWrite({
    address: DOCU_VAULT_ADDRESS,
    abi: DocuVaultABI,
    functionName: 'registerDocument',
  });
  
  const handleRegister = async (documentData: DocumentData) => {
    try {
      const tx = await writeAsync({
        args: [documentData.cid, documentData.hash, documentData.type],
      });
      
      await tx.wait();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Routing Architecture

### Route Configuration

```typescript
// routes/index.tsx
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ':id',
            element: <DocumentDetails />,
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <RoleProtectedRoute role="admin">
            <AdminLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            path: 'users',
            element: <UserManagement />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
];
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
```

## Provider Architecture

### Provider Hierarchy

```typescript
// App.tsx
function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <AuthProvider>
            <SIWEProvider>
              <RouterProvider router={router} />
              <Toaster />
            </SIWEProvider>
          </AuthProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
```

### Custom Provider Pattern

```typescript
// providers/AuthProvider.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Authentication logic
  
  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state]
  );
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Hook Architecture

### Custom Hook Categories

#### 1. **Data Hooks**
```typescript
// hooks/useDocuments.ts
export function useDocuments(filters?: DocumentFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentService.getDocuments(filters),
  });
  
  return {
    documents: data?.documents ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
  };
}
```

#### 2. **Action Hooks**
```typescript
// hooks/useDocumentActions.ts
export function useDocumentActions() {
  const queryClient = useQueryClient();
  
  const uploadDocument = useMutation({
    mutationFn: documentService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
  
  const verifyDocument = useMutation({
    mutationFn: documentService.verify,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['document', variables.id], data);
    },
  });
  
  return {
    uploadDocument,
    verifyDocument,
  };
}
```

#### 3. **UI Hooks**
```typescript
// hooks/useModal.ts
export function useModal<T = void>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);
  
  const open = useCallback((modalData?: T) => {
    setData(modalData ?? null);
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
  
  return {
    isOpen,
    data,
    open,
    close,
  };
}
```

## Error Handling Architecture

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Global Error Handling

```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
}
```

## Performance Architecture

### Code Splitting

```typescript
// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const Profile = lazy(() => import('./pages/Profile'));

// Route configuration with Suspense
<Route
  path="/dashboard"
  element={
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  }
/>
```

### Memoization Patterns

```typescript
// Memoized components
const DocumentList = memo(({ documents }: Props) => {
  return (
    <div>
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
});

// Memoized values
const expensiveCalculation = useMemo(
  () => calculateDocumentStats(documents),
  [documents]
);

// Memoized callbacks
const handleSubmit = useCallback(
  async (data: FormData) => {
    await submitForm(data);
  },
  [submitForm]
);
```

### Virtual Scrolling

```typescript
// For large lists
import { VirtualList } from '@tanstack/react-virtual';

function DocumentTable({ documents }: { documents: Document[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: documents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <DocumentRow
            key={virtualRow.index}
            document={documents[virtualRow.index]}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Testing Architecture

### Test Structure

```
src/
├── __tests__/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/           # End-to-end tests
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
└── hooks/
    └── useAuth/
        ├── useAuth.ts
        └── useAuth.test.ts
```

### Testing Patterns

```typescript
// Component testing
describe('DocumentCard', () => {
  it('renders document information correctly', () => {
    const document = mockDocument();
    render(<DocumentCard document={document} />);
    
    expect(screen.getByText(document.title)).toBeInTheDocument();
    expect(screen.getByText(document.status)).toBeInTheDocument();
  });
  
  it('calls onVerify when verify button is clicked', async () => {
    const onVerify = jest.fn();
    render(<DocumentCard document={mockDocument()} onVerify={onVerify} />);
    
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    
    expect(onVerify).toHaveBeenCalledTimes(1);
  });
});

// Hook testing
describe('useAuth', () => {
  it('provides authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

## Build Architecture

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    visualizer({
      template: 'treemap',
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['ethers', 'wagmi', 'viem'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

### Environment Configuration

```typescript
// config/env.ts
const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
  ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
} as const;

export default env;
```