# Performance Optimization Guide

## Overview

This guide provides comprehensive strategies and techniques for optimizing the performance of the Docu frontend application. We focus on improving loading times, runtime performance, and overall user experience.

## Performance Metrics

### Core Web Vitals

1. **Largest Contentful Paint (LCP)**: < 2.5s
2. **First Input Delay (FID)**: < 100ms
3. **Cumulative Layout Shift (CLS)**: < 0.1

### Additional Metrics

- **Time to Interactive (TTI)**: < 3.8s
- **First Contentful Paint (FCP)**: < 1.8s
- **Total Blocking Time (TBT)**: < 300ms

## Bundle Optimization

### Code Splitting

#### Route-Based Splitting

```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load route components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Documents = lazy(() => import('@/pages/Documents'));
const DocumentDetails = lazy(() => import('@/pages/DocumentDetails'));
const Profile = lazy(() => import('@/pages/Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-Based Splitting

```typescript
// Heavy component lazy loading
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'));
const DocumentViewer = lazy(() => import('@/components/documents/DocumentViewer'));

function DocumentDetails() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Analytics</button>
      
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Tree Shaking

```typescript
// ❌ Bad: Importing entire library
import * as lodash from 'lodash';
const result = lodash.debounce(fn, 300);

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// ✅ Better: Use ES modules
import { debounce } from 'lodash-es';
const result = debounce(fn, 300);
```

### Bundle Analysis

```javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

## Loading Performance

### Progressive Enhancement

```typescript
// components/ProgressiveImage.tsx
interface ProgressiveImageProps {
  src: string;
  placeholder: string;
  alt: string;
}

function ProgressiveImage({ src, placeholder, alt }: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
  }, [src]);
  
  return (
    <div className={cn('relative', isLoading && 'animate-pulse')}>
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-50' : 'opacity-100'
        )}
      />
    </div>
  );
}
```

### Preloading Critical Resources

```html
<!-- index.html -->
<head>
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://api.docu.example.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Preload critical CSS -->
  <link rel="preload" href="/assets/main.css" as="style">
  
  <!-- Prefetch next route -->
  <link rel="prefetch" href="/dashboard">
</head>
```

### Resource Hints

```typescript
// hooks/use-prefetch.ts
export function usePrefetch() {
  const prefetchRoute = useCallback((path: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }, []);
  
  const prefetchComponent = useCallback((componentPath: string) => {
    import(componentPath);
  }, []);
  
  return { prefetchRoute, prefetchComponent };
}

// Usage
function Navigation() {
  const { prefetchRoute } = usePrefetch();
  
  return (
    <nav>
      <Link 
        to="/documents" 
        onMouseEnter={() => prefetchRoute('/documents')}
      >
        Documents
      </Link>
    </nav>
  );
}
```

## Runtime Performance

### React Optimization

#### Memoization

```typescript
// Memoize expensive components
const ExpensiveList = memo(({ items, filter }) => {
  const filteredItems = useMemo(
    () => items.filter(item => item.category === filter),
    [items, filter]
  );
  
  return (
    <div>
      {filteredItems.map(item => (
        <ListItem key={item.id} {...item} />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.filter === nextProps.filter &&
    prevProps.items.length === nextProps.items.length
  );
});
```

#### useCallback Optimization

```typescript
// Prevent unnecessary re-renders
function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // ❌ Bad: Creates new function on every render
  const handleDelete = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  };
  
  // ✅ Good: Memoized callback
  const handleDelete = useCallback((id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  }, []);
  
  return documents.map(doc => (
    <DocumentCard
      key={doc.id}
      document={doc}
      onDelete={handleDelete}
    />
  ));
}
```

#### Virtual Scrolling

```typescript
// components/VirtualList.tsx
import { FixedSizeList } from 'react-window';

function VirtualDocumentList({ documents }: { documents: Document[] }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <DocumentCard document={documents[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={documents.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### State Management Optimization

#### Selective Subscriptions

```typescript
// ❌ Bad: Subscribe to entire store
const store = useDocumentStore();

// ✅ Good: Subscribe to specific slices
const documents = useDocumentStore(state => state.documents);
const isLoading = useDocumentStore(state => state.isLoading);

// ✅ Better: Use shallow comparison for objects
const { filters, sortBy } = useDocumentStore(
  useShallow(state => ({
    filters: state.filters,
    sortBy: state.sortBy
  }))
);
```

#### Query Optimization

```typescript
// Optimize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

// Parallel queries
const results = useQueries({
  queries: [
    { queryKey: ['user'], queryFn: fetchUser, staleTime: Infinity },
    { queryKey: ['documents'], queryFn: fetchDocuments },
    { queryKey: ['stats'], queryFn: fetchStats },
  ],
});
```

## Image Optimization

### Responsive Images

```typescript
// components/ResponsiveImage.tsx
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
}

function ResponsiveImage({ src, alt, sizes }: ResponsiveImageProps) {
  const srcSet = useMemo(() => {
    const widths = [320, 640, 768, 1024, 1280];
    return widths
      .map(w => `${src}?w=${w} ${w}w`)
      .join(', ');
  }, [src]);
  
  return (
    <img
      src={`${src}?w=1280`}
      srcSet={srcSet}
      sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
```

### Image Loading Strategies

```typescript
// hooks/use-intersection-observer.ts
function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isIntersecting;
}

// Lazy load images
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
  
  return (
    <div ref={ref}>
      {isVisible ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="bg-gray-200 animate-pulse h-48" />
      )}
    </div>
  );
}
```

## Web3 Optimization

### Contract Call Batching

```typescript
// lib/web3-batch.ts
import { multicall } from '@wagmi/core';

async function batchContractReads(documents: string[]) {
  const contracts = documents.map(docId => ({
    address: CONTRACT_ADDRESS,
    abi: DocuVaultABI,
    functionName: 'getDocument',
    args: [docId],
  }));
  
  const results = await multicall({ contracts });
  return results.map(result => result.result);
}
```

### Wallet Connection Optimization

```typescript
// Lazy load Web3 providers
const Web3Provider = lazy(() => import('@/providers/Web3Provider'));

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  
  return (
    <>
      {walletConnected ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Web3Provider>
            <AuthenticatedApp />
          </Web3Provider>
        </Suspense>
      ) : (
        <UnauthenticatedApp onConnect={() => setWalletConnected(true)} />
      )}
    </>
  );
}
```

## Caching Strategies

### Service Worker

```javascript
// sw.js
const CACHE_NAME = 'docu-v1';
const urlsToCache = [
  '/',
  '/assets/main.css',
  '/assets/main.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache new responses
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        });
      })
  );
});
```

### Local Storage Optimization

```typescript
// lib/storage.ts
class OptimizedStorage {
  private cache = new Map<string, any>();
  
  get<T>(key: string): T | null {
    // Check memory cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { value, expiry } = JSON.parse(item);
      
      // Check expiry
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      // Update cache
      this.cache.set(key, value);
      return value;
    } catch {
      return null;
    }
  }
  
  set<T>(key: string, value: T, ttl?: number): void {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl : null,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
    this.cache.set(key, value);
  }
  
  remove(key: string): void {
    localStorage.removeItem(key);
    this.cache.delete(key);
  }
  
  clear(): void {
    localStorage.clear();
    this.cache.clear();
  }
}

export const storage = new OptimizedStorage();
```

## Performance Monitoring

### Custom Performance Marks

```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
  static mark(name: string) {
    if ('performance' in window) {
      performance.mark(name);
    }
  }
  
  static measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (e) {
        console.error('Performance measurement failed:', e);
      }
    }
  }
  
  static clearMarks() {
    if ('performance' in window) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Usage
PerformanceMonitor.mark('documents-fetch-start');
const documents = await fetchDocuments();
PerformanceMonitor.mark('documents-fetch-end');
PerformanceMonitor.measure(
  'documents-fetch-time',
  'documents-fetch-start',
  'documents-fetch-end'
);
```

### React Profiler Integration

```typescript
// components/ProfiledComponent.tsx
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  // Send metrics to analytics
  if (actualDuration > 16) {
    console.warn(`Slow render in ${id}: ${actualDuration}ms`);
    logEvent('Performance', 'SlowRender', id, Math.round(actualDuration));
  }
};

function ProfiledDocumentList({ documents }) {
  return (
    <Profiler id="DocumentList" onRender={onRenderCallback}>
      <DocumentList documents={documents} />
    </Profiler>
  );
}
```

## Build-Time Optimization

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'ui-vendor';
            if (id.includes('wagmi') || id.includes('viem')) return 'web3-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

## Performance Budget

```javascript
// performance-budget.js
module.exports = {
  bundles: [
    {
      name: 'main',
      path: 'dist/assets/main-*.js',
      maxSize: '150kb',
    },
    {
      name: 'vendor',
      path: 'dist/assets/vendor-*.js',
      maxSize: '200kb',
    },
  ],
  metrics: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    tti: 3800,
  },
};
```

## Debugging Performance Issues

### Chrome DevTools

```typescript
// Enable React DevTools Profiler
if (import.meta.env.DEV) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true;
}

// Performance debugging utilities
export const perfDebug = {
  startProfiling: (name: string) => {
    if (import.meta.env.DEV) {
      console.time(name);
      performance.mark(`${name}-start`);
    }
  },
  
  endProfiling: (name: string) => {
    if (import.meta.env.DEV) {
      console.timeEnd(name);
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  },
  
  logRenderCount: (() => {
    let count = 0;
    return (componentName: string) => {
      if (import.meta.env.DEV) {
        console.log(`${componentName} rendered ${++count} times`);
      }
    };
  })(),
};
```

## Best Practices Summary

1. **Load Critical Resources First**: Prioritize above-the-fold content
2. **Lazy Load Non-Critical Resources**: Defer loading of off-screen images and components
3. **Minimize Bundle Size**: Use tree shaking and code splitting
4. **Optimize Re-renders**: Use memoization and proper state management
5. **Cache Aggressively**: Implement service workers and browser caching
6. **Monitor Performance**: Set up real user monitoring (RUM)
7. **Set Performance Budgets**: Enforce limits on bundle sizes and metrics

## Resources

- [Web Performance Working Group](https://www.w3.org/webperf/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)