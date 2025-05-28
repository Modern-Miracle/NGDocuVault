# Deployment Guide

## Overview

This guide covers deploying the Docu frontend application to various platforms and environments. We'll cover build optimization, environment configuration, CI/CD setup, and monitoring.

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Bundle size within limits
- [ ] Security audit clean (`pnpm audit`)

### 2. Environment Configuration

- [ ] Environment variables documented
- [ ] Production API endpoints configured
- [ ] Smart contract addresses updated
- [ ] Analytics/monitoring configured
- [ ] Error tracking setup

### 3. Performance

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Caching strategy defined

## Build Configuration

### Production Build

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm build

# Output will be in dist/ directory
```

### Build Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.docu.example.com
VITE_INFURA_ID=your_production_infura_id
VITE_WALLETCONNECT_PROJECT_ID=your_production_walletconnect_id
VITE_CONTRACT_ADDRESS=0x...production_address
VITE_CHAIN_ID=1
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

## Deployment Platforms

### Vercel

#### Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to Vercel
vercel --prod

# Or connect to GitHub for automatic deployments
```

### Netlify

#### Configuration

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[build.environment]
  NODE_VERSION = "18"
```

#### Deployment

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

#### S3 Bucket Configuration

```bash
# Create S3 bucket
aws s3 mb s3://docu-frontend-prod

# Enable static website hosting
aws s3 website s3://docu-frontend-prod \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://docu-frontend-prod \
  --delete \
  --cache-control max-age=31536000,public \
  --exclude index.html

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://docu-frontend-prod \
  --cache-control no-cache,no-store,must-revalidate
```

#### CloudFront Configuration

```json
{
  "Origins": [{
    "DomainName": "docu-frontend-prod.s3-website.region.amazonaws.com",
    "Id": "S3-docu-frontend",
    "S3OriginConfig": {
      "OriginAccessIdentity": ""
    }
  }],
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": [{
    "ErrorCode": 404,
    "ResponseCode": 200,
    "ResponsePagePath": "/index.html"
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-docu-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }
}
```

### Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build application
RUN pnpm build:web

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  
  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml;
  
  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
    
    # Don't cache index.html
    location = /index.html {
      add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA fallback
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test
      
      - name: Run linter
        run: pnpm lint
      
      - name: Type check
        run: pnpm type-check
      
      - name: Build
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_CONTRACT_ADDRESS: ${{ secrets.VITE_CONTRACT_ADDRESS }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: apps/web/dist

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist
      
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  PNPM_CACHE_FOLDER: .pnpm-cache

cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - $PNPM_CACHE_FOLDER

test:
  stage: test
  image: node:18
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm test
    - pnpm lint
    - pnpm type-check

build:
  stage: build
  image: node:18
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm build
  artifacts:
    paths:
      - apps/web/dist
    expire_in: 1 day

deploy:
  stage: deploy
  image: amazon/aws-cli
  only:
    - main
  script:
    - aws s3 sync apps/web/dist/ s3://$S3_BUCKET --delete
    - aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"
```

## Monitoring & Analytics

### Sentry Integration

```typescript
// main.tsx
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}
```

### Google Analytics

```typescript
// lib/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  if (import.meta.env.PROD) {
    ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
  }
};

export const logPageView = (path: string) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const logEvent = (category: string, action: string, label?: string) => {
  if (import.meta.env.PROD) {
    ReactGA.event({ category, action, label });
  }
};

// Usage in App.tsx
const location = useLocation();

useEffect(() => {
  logPageView(location.pathname + location.search);
}, [location]);
```

### Performance Monitoring

```typescript
// lib/performance.ts
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// main.tsx
reportWebVitals((metric) => {
  // Send to analytics
  logEvent('Web Vitals', metric.name, metric.value.toString());
  
  // Or send to custom endpoint
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
});
```

## Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.docu.example.com wss://relay.walletconnect.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

### Environment Variable Security

```typescript
// lib/config.ts
const validateEnvVars = () => {
  const required = [
    'VITE_API_URL',
    'VITE_CONTRACT_ADDRESS',
    'VITE_CHAIN_ID',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

if (import.meta.env.PROD) {
  validateEnvVars();
}
```

## Rollback Strategy

### Version Control

```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v0.9.0
pnpm install
pnpm build
# Deploy...
```

### Blue-Green Deployment

```bash
# Deploy to staging
aws s3 sync dist/ s3://docu-frontend-staging

# Test staging
# If successful, swap with production
aws s3 sync s3://docu-frontend-prod s3://docu-frontend-backup
aws s3 sync s3://docu-frontend-staging s3://docu-frontend-prod

# If issues, rollback
aws s3 sync s3://docu-frontend-backup s3://docu-frontend-prod
```

## Post-Deployment

### Health Checks

```typescript
// api/health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION,
    timestamp: new Date().toISOString(),
  });
});
```

### Smoke Tests

```javascript
// scripts/smoke-test.js
const puppeteer = require('puppeteer');

async function runSmokeTests() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // Test homepage loads
    await page.goto(process.env.APP_URL);
    await page.waitForSelector('#root');
    
    // Test wallet connection
    await page.click('[data-testid="connect-wallet"]');
    await page.waitForSelector('[data-testid="wallet-modal"]');
    
    console.log('✅ Smoke tests passed');
  } catch (error) {
    console.error('❌ Smoke tests failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSmokeTests();
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node version compatibility
   - Clear cache: `pnpm clean && pnpm install`
   - Verify environment variables

2. **Deployment Failures**
   - Check deployment credentials
   - Verify build artifacts
   - Review deployment logs

3. **Runtime Errors**
   - Check browser console
   - Review Sentry reports
   - Verify API connectivity

### Debug Mode

```typescript
// Enable debug mode
localStorage.setItem('debug', 'docu:*');

// Debug logging
import debug from 'debug';
const log = debug('docu:deployment');
log('Deployment configuration:', config);
```

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Production Best Practices](https://react.dev/learn/start-a-new-react-project)
- [Web.dev Performance](https://web.dev/performance/)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)