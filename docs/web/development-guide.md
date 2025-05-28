# Development Guide

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **Git**: Latest version
- **Docker**: For running local services (optional)
- **MetaMask**: Or any Web3 wallet for testing

### Recommended Tools

- **VS Code**: With recommended extensions
- **React Developer Tools**: Browser extension
- **Redux DevTools**: For Zustand debugging
- **Postman/Insomnia**: For API testing

## Setup Instructions

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/docu.git
cd docu

# Install dependencies
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp apps/web/.env.example apps/web/.env

# Configure environment variables
VITE_API_URL=http://localhost:5000
VITE_INFURA_ID=your_infura_project_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=31337
```

### 3. Start Development Services

```bash
# Start all services (from root)
pnpm dev

# Or start individually
pnpm dev:api      # API server on :5000
pnpm dev:contract # Hardhat node on :8545
pnpm dev:web      # Web app on :5173
```

### 4. Deploy Local Contracts

```bash
# In apps/contract directory
pnpm deploy:local

# Copy deployed addresses to web/.env
VITE_CONTRACT_ADDRESS=<deployed_address>
```

## Development Workflow

### Project Structure

```
apps/web/
├── src/
│   ├── components/      # UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   ├── pages/          # Route pages
│   ├── services/       # API services
│   └── types/          # TypeScript types
├── public/             # Static assets
└── index.html          # Entry HTML
```

### Component Development

#### Creating New Components

```bash
# Component structure
src/components/
└── feature-name/
    ├── index.ts              # Public exports
    ├── FeatureName.tsx       # Main component
    ├── FeatureName.test.tsx  # Tests
    ├── FeatureName.stories.tsx # Storybook
    └── types.ts              # Component types
```

#### Component Template

```typescript
// components/feature-name/FeatureName.tsx
import { FC } from 'react';
import { cn } from '@/lib/utils';
import { FeatureNameProps } from './types';

export const FeatureName: FC<FeatureNameProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('feature-name', className)} {...props}>
      {children}
    </div>
  );
};

// components/feature-name/index.ts
export { FeatureName } from './FeatureName';
export type { FeatureNameProps } from './types';
```

### Hook Development

#### Custom Hook Template

```typescript
// hooks/use-feature.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export interface UseFeatureOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
}

export function useFeature(options: UseFeatureOptions = {}) {
  const [localState, setLocalState] = useState();
  
  // Query for fetching data
  const query = useQuery({
    queryKey: queryKeys.feature.all,
    queryFn: fetchFeatureData,
    enabled: options.enabled,
  });
  
  // Mutation for updates
  const mutation = useMutation({
    mutationFn: updateFeature,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feature.all });
      options.onSuccess?.(data);
    },
  });
  
  // Computed values
  const computedValue = useMemo(() => {
    return query.data?.filter(/* logic */);
  }, [query.data]);
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    computedValue,
  };
}
```

### API Integration

#### Service Layer

```typescript
// services/feature.service.ts
import { apiClient } from '@/lib/client';
import { Feature, CreateFeatureDto } from '@/types/feature';

export const featureService = {
  // GET endpoints
  async getAll(): Promise<Feature[]> {
    const { data } = await apiClient.get('/features');
    return data.data;
  },
  
  async getById(id: string): Promise<Feature> {
    const { data } = await apiClient.get(`/features/${id}`);
    return data.data;
  },
  
  // POST endpoints
  async create(dto: CreateFeatureDto): Promise<Feature> {
    const { data } = await apiClient.post('/features', dto);
    return data.data;
  },
  
  // PUT endpoints
  async update(id: string, dto: Partial<Feature>): Promise<Feature> {
    const { data } = await apiClient.put(`/features/${id}`, dto);
    return data.data;
  },
  
  // DELETE endpoints
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/features/${id}`);
  },
};
```

### State Management

#### Zustand Store Pattern

```typescript
// stores/feature-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface FeatureState {
  // State
  items: Feature[];
  selectedId: string | null;
  filters: FeatureFilters;
  
  // Actions
  setItems: (items: Feature[]) => void;
  selectItem: (id: string | null) => void;
  updateFilters: (filters: Partial<FeatureFilters>) => void;
  reset: () => void;
}

const initialState = {
  items: [],
  selectedId: null,
  filters: {},
};

export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setItems: (items) => set({ items }),
        
        selectItem: (selectedId) => set({ selectedId }),
        
        updateFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),
        
        reset: () => set(initialState),
      }),
      {
        name: 'feature-store',
        partialize: (state) => ({ filters: state.filters }),
      }
    )
  )
);
```

### Styling Guidelines

#### Component Styling

```typescript
// Using Tailwind with cn utility
import { cn } from '@/lib/utils';

// Base component with variants
const Button = ({ variant = 'primary', size = 'md', className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'outline',
        },
        
        // Sizes
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-11 px-8': size === 'lg',
        },
        
        className
      )}
      {...props}
    />
  );
};
```

#### CSS Modules (if needed)

```scss
// components/Feature/Feature.module.css
.container {
  @apply relative flex flex-col gap-4;
  
  &.active {
    @apply border-primary;
  }
}

.title {
  @apply text-lg font-semibold;
  
  @media (min-width: 768px) {
    @apply text-xl;
  }
}
```

### Testing

#### Component Testing

```typescript
// components/Feature/__tests__/Feature.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Feature } from '../Feature';

describe('Feature', () => {
  it('renders correctly', () => {
    render(<Feature title="Test Feature" />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Feature onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies custom className', () => {
    const { container } = render(<Feature className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

#### Hook Testing

```typescript
// hooks/__tests__/use-feature.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useFeature } from '../use-feature';
import { createWrapper } from '@/test/utils';

describe('useFeature', () => {
  it('fetches data on mount', async () => {
    const { result } = renderHook(() => useFeature(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

### Code Quality

#### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
```

#### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Performance Optimization

#### Code Splitting

```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const DocumentDetails = lazy(() => import('@/pages/DocumentDetails'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/documents/:id" element={<DocumentDetails />} />
      </Routes>
    </Suspense>
  );
}
```

#### Memoization

```typescript
// Memoize expensive computations
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveOperation(item),
    }));
  }, [data]);
  
  return <div>{/* Render processedData */}</div>;
});
```

### Debugging

#### React DevTools

```typescript
// Add display names for debugging
Component.displayName = 'MyComponent';

// Use React DevTools Profiler
<Profiler id="Feature" onRender={onRenderCallback}>
  <Feature />
</Profiler>
```

#### Console Helpers

```typescript
// lib/debug.ts
export const debug = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  table: (data: any) => {
    if (import.meta.env.DEV) {
      console.table(data);
    }
  },
  
  time: (label: string) => {
    if (import.meta.env.DEV) {
      console.time(label);
    }
  },
  
  timeEnd: (label: string) => {
    if (import.meta.env.DEV) {
      console.timeEnd(label);
    }
  },
};
```

### Git Workflow

#### Branch Strategy

```bash
# Feature development
git checkout -b feature/feature-name

# Bug fixes
git checkout -b fix/bug-description

# Hotfixes
git checkout -b hotfix/critical-issue
```

#### Commit Convention

```bash
# Format: <type>(<scope>): <subject>

# Examples
git commit -m "feat(auth): add SIWE authentication"
git commit -m "fix(documents): resolve upload error"
git commit -m "refactor(components): optimize Button component"
git commit -m "docs(readme): update setup instructions"
```

### Build & Bundle Analysis

```bash
# Build for production
pnpm build

# Analyze bundle size
pnpm analyze

# Preview production build
pnpm preview
```

### Common Issues & Solutions

#### 1. Module Resolution

```typescript
// tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"]
    }
  }
}
```

#### 2. Type Errors

```typescript
// Declare module for assets
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}
```

#### 3. Environment Variables

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  // Add other env vars
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)