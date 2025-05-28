# State Management

## Overview

The Docu frontend application uses a combination of state management solutions to handle different types of state effectively. This document outlines our state management architecture, patterns, and best practices.

## State Categories

### 1. Server State
- **Solution**: React Query (TanStack Query)
- **Use Cases**: API data, cached responses, synchronization
- **Examples**: Documents, user data, verification status

### 2. Global Client State
- **Solution**: Zustand
- **Use Cases**: Authentication state, user preferences, UI state
- **Examples**: User session, theme, sidebar collapse

### 3. Local Component State
- **Solution**: React useState/useReducer
- **Use Cases**: Form inputs, UI toggles, temporary state
- **Examples**: Modal visibility, form validation

### 4. Web3 State
- **Solution**: Wagmi + ConnectKit
- **Use Cases**: Wallet connection, blockchain data
- **Examples**: Account address, chain ID, contract state

## Architecture

### State Flow Diagram

```
┌─────────────────┐     ┌──────────────────┐
│   Components    │────▶│  Custom Hooks    │
└─────────────────┘     └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Local State    │     │  State Stores    │
│  (useState)     │     │  (Zustand)       │
└─────────────────┘     └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  React Query    │◀────│   API Client     │
│  (Server State) │     │                  │
└─────────────────┘     └──────────────────┘
```

## Zustand Stores

### Auth Store

```typescript
// lib/store/auth-store.ts
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  login: async (credentials) => {
    // Implementation
  },
  
  logout: async () => {
    // Implementation
  },
  
  refreshToken: async () => {
    // Implementation
  }
}));
```

### UI Store

```typescript
// lib/store/ui-store.ts
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}
```

## React Query Patterns

### Query Keys

```typescript
// lib/query-keys.ts
export const queryKeys = {
  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters: DocumentFilters) => [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    profile: (address: string) => [...queryKeys.users.all, 'profile', address] as const,
  },
  
  // IPFS
  ipfs: {
    uploads: ['ipfs', 'uploads'] as const,
    content: (cid: string) => ['ipfs', 'content', cid] as const,
  }
};
```

### Custom Hooks

```typescript
// hooks/use-documents-data.ts
export function useDocumentsData(filters?: DocumentFilters) {
  const queryClient = useQueryClient();
  
  // Fetch documents
  const documentsQuery = useQuery({
    queryKey: queryKeys.documents.list(filters),
    queryFn: () => fetchDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Create document mutation
  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.lists()
      });
    },
  });
  
  // Optimistic updates
  const updateDocument = useMutation({
    mutationFn: updateDocumentAPI,
    onMutate: async (newDocument) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.detail(newDocument.id)
      });
      
      // Snapshot previous value
      const previousDocument = queryClient.getQueryData(
        queryKeys.documents.detail(newDocument.id)
      );
      
      // Optimistically update
      queryClient.setQueryData(
        queryKeys.documents.detail(newDocument.id),
        newDocument
      );
      
      return { previousDocument };
    },
    onError: (err, newDocument, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.documents.detail(newDocument.id),
        context.previousDocument
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all
      });
    },
  });
  
  return {
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    createDocument: createMutation.mutate,
    updateDocument: updateDocument.mutate,
  };
}
```

## Data Flow Patterns

### 1. Server State Synchronization

```typescript
// Automatic refetch on window focus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Manual invalidation after mutations
const handleDocumentUpdate = async (document: Document) => {
  await updateDocument(document);
  // Invalidate and refetch related queries
  queryClient.invalidateQueries({ queryKey: ['documents'] });
  queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
};
```

### 2. Optimistic Updates

```typescript
const useOptimisticDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDocumentStatus,
    onMutate: async (variables) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: ['document', variables.id]
      });
      
      // Save snapshot
      const snapshot = queryClient.getQueryData(['document', variables.id]);
      
      // Optimistic update
      queryClient.setQueryData(['document', variables.id], (old) => ({
        ...old,
        status: variables.status,
      }));
      
      return { snapshot };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.snapshot) {
        queryClient.setQueryData(
          ['document', variables.id],
          context.snapshot
        );
      }
    },
  });
};
```

### 3. Infinite Queries

```typescript
const useInfiniteDocuments = () => {
  return useInfiniteQuery({
    queryKey: ['documents', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchDocuments({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

## State Management Best Practices

### 1. State Colocation

```typescript
// ❌ Bad: Global state for local concerns
const useGlobalStore = create((set) => ({
  registerFormData: {},
  setRegisterFormData: (data) => set({ registerFormData: data }),
}));

// ✅ Good: Local state for component-specific data
function RegisterForm() {
  const [formData, setFormData] = useState({});
  // Form logic here
}
```

### 2. Derived State

```typescript
// ❌ Bad: Storing computed values
const useDocumentStore = create((set) => ({
  documents: [],
  verifiedDocuments: [], // Redundant
  updateVerifiedDocuments: () => {
    // Manual sync logic
  },
}));

// ✅ Good: Computing on demand
const useDocuments = () => {
  const documents = useDocumentStore((state) => state.documents);
  const verifiedDocuments = useMemo(
    () => documents.filter(doc => doc.verified),
    [documents]
  );
  return { documents, verifiedDocuments };
};
```

### 3. Subscription Optimization

```typescript
// ❌ Bad: Subscribing to entire store
const Component = () => {
  const store = useAuthStore();
  // Re-renders on any store change
};

// ✅ Good: Selective subscriptions
const Component = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Only re-renders when user or isAuthenticated changes
};
```

### 4. Async State Management

```typescript
// Custom hook for async operations with loading states
const useAsyncAction = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    data: null,
  });
  
  const execute = useCallback(async (asyncFunction) => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const data = await asyncFunction();
      setState({ isLoading: false, error: null, data });
      return data;
    } catch (error) {
      setState({ isLoading: false, error, data: null });
      throw error;
    }
  }, []);
  
  return { ...state, execute };
};
```

## Performance Optimization

### 1. Query Optimization

```typescript
// Parallel queries
const useDocumentDetails = (id: string) => {
  const results = useQueries({
    queries: [
      { queryKey: ['document', id], queryFn: () => fetchDocument(id) },
      { queryKey: ['document', id, 'history'], queryFn: () => fetchHistory(id) },
      { queryKey: ['document', id, 'access'], queryFn: () => fetchAccess(id) },
    ],
  });
  
  return {
    document: results[0].data,
    history: results[1].data,
    access: results[2].data,
    isLoading: results.some(result => result.isLoading),
  };
};
```

### 2. Selective Re-renders

```typescript
// Using shallow comparison
const useShallowStore = () => {
  const { documents, filters } = useDocumentStore(
    useShallow((state) => ({
      documents: state.documents,
      filters: state.filters,
    }))
  );
};
```

### 3. Memoization

```typescript
const useFilteredDocuments = (filters: Filters) => {
  const documents = useDocumentStore((state) => state.documents);
  
  return useMemo(() => {
    return documents.filter(doc => {
      // Complex filtering logic
    });
  }, [documents, filters]);
};
```

## Testing State Management

### Testing Zustand Stores

```typescript
// __tests__/stores/auth-store.test.ts
describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
  
  it('should login user', async () => {
    const { login } = useAuthStore.getState();
    await login({ username: 'test', password: 'password' });
    
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeDefined();
    expect(isAuthenticated).toBe(true);
  });
});
```

### Testing React Query

```typescript
// __tests__/hooks/use-documents.test.ts
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDocuments', () => {
  it('should fetch documents', async () => {
    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.documents).toHaveLength(3);
  });
});
```

## Migration Guide

### From Redux to Zustand

```typescript
// Before (Redux)
const mapStateToProps = (state) => ({
  user: state.auth.user,
  isLoading: state.auth.isLoading,
});

const mapDispatchToProps = {
  login: authActions.login,
};

// After (Zustand)
const Component = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
};
```

## Debugging

### React Query DevTools

```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Zustand DevTools

```typescript
// Enable Redux DevTools
const useAuthStore = create(
  devtools(
    (set) => ({
      // Store implementation
    }),
    {
      name: 'auth-store',
    }
  )
);
```

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Wagmi Documentation](https://wagmi.sh)
- [React Performance](https://react.dev/learn/render-and-commit)