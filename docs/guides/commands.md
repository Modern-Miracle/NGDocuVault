# Development Commands Guide

This guide covers all the essential commands for developing with the Docu platform.

## 🚀 Root-Level Commands (pnpm)

### Installation and Setup
```bash
# Install all dependencies
pnpm install

# Clean install (removes node_modules first)
pnpm clean && pnpm install
```

### Development
```bash
# Start all applications in development mode
pnpm dev

# Start specific applications
pnpm dev:api      # Start API server only
pnpm dev:web      # Start web app only
pnpm dev:contract # Start local blockchain node
```

### Building
```bash
# Build all applications and packages
pnpm build

# Build specific apps
pnpm build:api
pnpm build:web
pnpm build:contract
```

### Code Quality
```bash
# Run linting across all packages
pnpm lint

# Format code with Prettier
pnpm format

# Type checking
pnpm check-types

# Run all checks
pnpm lint && pnpm format && pnpm check-types
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 API Commands (apps/api)

### Development
```bash
cd apps/api

# Start development server with hot reload
pnpm dev

# Start production server
pnpm start

# Build for production
pnpm build
```

### Database Management
```bash
# Start SQL Server in Docker
pnpm db:start

# Stop database
pnpm db:stop

# Initialize database schema
pnpm db:setup

# Clear all data
pnpm db:clear

# Full setup (stop, start, wait, setup)
pnpm db:prepare

# Clean rebuild (stop, start, wait, clear, setup)
pnpm db:rebuild
```

### Testing
```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test user.test.ts
```

## 🔗 Contract Commands (apps/contract)

### Development
```bash
cd apps/contract

# Start local Hardhat node
pnpm dev

# Start node and deploy contracts
pnpm dev:deploy
```

### Compilation and Types
```bash
# Compile Solidity contracts
pnpm build

# Generate TypeScript types
pnpm typechain

# Clean artifacts and cache
pnpm clean
```

### Testing
```bash
# Run contract tests
pnpm test

# Run specific test
pnpm test test/DocuVault.test.ts

# Generate coverage report
pnpm coverage
```

### Deployment
```bash
# Deploy to local network
pnpm deploy

# Deploy to testnet
pnpm deploy:sepolia

# Deploy specific contract
pnpm hardhat deploy --tags DocuVault

# Verify on Etherscan
pnpm verify:sepolia <CONTRACT_ADDRESS>
```

### Scripts
```bash
# Setup initial admin
pnpm hardhat run scripts/setup-initial-admin.ts --network localhost

# Register users with roles
pnpm hardhat run scripts/register-admin.ts --network localhost -- <address>
pnpm hardhat run scripts/register-issuer.ts --network localhost -- <address>
pnpm hardhat run scripts/register-verifier.ts --network localhost -- <address>
pnpm hardhat run scripts/register-holder.ts --network localhost -- <address>

# Register all roles at once
pnpm hardhat run scripts/register-all-roles.ts --network localhost
```

## 🌐 Web App Commands (apps/web)

### Development
```bash
cd apps/web

# Start development server
pnpm dev

# Start with specific port
pnpm dev --port 3001

# Start with host exposure
pnpm dev --host
```

### Building
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Analyze bundle size
pnpm build --analyze
```

### Testing
```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 🛠️ Utility Commands

### Clean Everything
```bash
# Remove all node_modules
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Remove all build artifacts
pnpm clean

# Fresh start
pnpm clean && pnpm install && pnpm build
```

### Check Project Health
```bash
# Run all checks
pnpm check-all

# Or manually
pnpm lint && pnpm check-types && pnpm test
```

### Update Dependencies
```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Update specific package
pnpm update @package-name
```

## 🐛 Debugging Commands

### API Debugging
```bash
# Start with debug logging
DEBUG=* pnpm dev:api

# Start with inspector
pnpm dev:api --inspect
```

### Contract Debugging
```bash
# Start node with verbose logging
pnpm hardhat node --verbose

# Run tests with gas reporting
REPORT_GAS=true pnpm test
```

### Web Debugging
```bash
# Start with source maps
pnpm dev --sourcemap

# Start with React profiling
REACT_APP_PROFILE=true pnpm dev
```

## 📝 Git Workflow Commands

### Conventional Commits
```bash
# Feature
git commit -m "feat: add user management"

# Bug fix
git commit -m "fix: resolve login issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve error handling"

# Tests
git commit -m "test: add user management tests"
```

### Branch Management
```bash
# Create feature branch
git checkout -b feature/user-management

# Create fix branch
git checkout -b fix/login-issue

# Sync with upstream
git fetch upstream
git merge upstream/main
```

## 🚨 Troubleshooting Commands

### Clear Caches
```bash
# Clear Turbo cache
pnpm turbo run build --force

# Clear Next.js cache
rm -rf apps/web/.next

# Clear Hardhat cache
cd apps/contract && pnpm hardhat clean
```

### Reset Everything
```bash
# Nuclear option - reset everything
git clean -fdx
pnpm install
pnpm build
```

## 📊 Performance Commands

### Bundle Analysis
```bash
# Analyze web app bundle
cd apps/web && pnpm build --analyze

# Check package sizes
pnpm dlx bundle-phobia
```

### Performance Testing
```bash
# Run lighthouse
pnpm dlx lighthouse http://localhost:3000

# Check build times
time pnpm build
```