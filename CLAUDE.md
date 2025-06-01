# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root-level commands (pnpm)

```bash
# Install dependencies
pnpm install

# Development (runs all apps in parallel)
pnpm dev

# Build all apps and packages
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

### API Commands (apps/api)

```bash
# Development server with hot reload
pnpm dev:api

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Database management
pnpm db:start      # Start SQL Server in Docker
pnpm db:stop       # Stop database
pnpm db:setup      # Initialize database schema
pnpm db:clear      # Clear database
pnpm db:prepare    # Full setup (stop, start, wait, setup)
pnpm db:rebuild    # Clean rebuild (stop, start, wait, clear, setup)
```

### Contract Commands (apps/contract)

```bash
# Start local Hardhat node
pnpm dev:contract

# Compile contracts
pnpm build

# Run tests
pnpm test

# Deploy to localhost
pnpm deploy

# Generate TypeScript types
pnpm typechain

# Coverage report
pnpm coverage
```

### Web App Commands (apps/web)

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture Overview

### Monorepo Structure

This is a Turborepo monorepo containing three main applications:

1. **API (apps/api)**: Express.js backend with TypeScript

   - Authentication via SIWE (Sign-In with Ethereum) and JWT
   - IPFS integration for document storage
   - SQL Server database with session management
   - Smart contract interaction via ethers.js

2. **Contracts (apps/contract)**: Solidity smart contracts

   - DocuVault: Main document verification contract
   - DID contracts: Registry, Auth, Issuer, Verifier
   - ZKP verifiers: Age, FHIR, Hash verification circuits
   - Hardhat for development and testing

3. **Web (apps/web)**: React + Vite frontend
   - Wallet connection via ConnectKit/wagmi
   - React Query for API state management
   - React Router for navigation
   - Radix UI + Tailwind CSS for UI components
   - Zustand for local state management

### Key Architectural Patterns

#### API Architecture

- **Service Layer Pattern**: Business logic in service classes
- **Middleware-based Authentication**: JWT and SIWE validation
- **Database Services**: Separate services for auth, access, and token management
- **Contract Services**: Dedicated services for each smart contract interaction

#### Frontend Architecture

- **Protected Routes**: Auth-based route protection
- **Provider Pattern**: Auth, Web3, and SIWE providers
- **Custom Hooks**: Abstracted contract and API interactions
- **Component Organization**:
  - `/components/auth`: Authentication components
  - `/components/documents`: Document management UI
  - `/components/ui`: Reusable UI components
  - `/components/user-flow`: User onboarding flows

#### Smart Contract Architecture

- **Role-Based Access Control**: Admin, Issuer, Verifier roles
- **Pausable Pattern**: Emergency pause functionality
- **Event-Driven**: Comprehensive event emission for off-chain indexing
- **Modular Verification**: Pluggable ZKP verifiers

### Authentication Flow

1. User connects wallet (MetaMask, etc.)
2. Frontend requests SIWE challenge from API
3. User signs message with wallet
4. API verifies signature and creates session
5. JWT tokens issued for subsequent requests
6. Refresh token rotation for security

### Document Management Flow

1. User uploads document to IPFS
2. Document hash registered on-chain
3. Issuer verifies document (optional)
4. Holder can grant/revoke access
5. Verifiers can check document validity

### Testing Strategy

- **API**: Jest for unit/integration tests
- **Contracts**: Hardhat tests with coverage reporting
- **Circuits**: Circom test framework for ZKP circuits

### Environment Configuration

- Uses `.env` files for configuration
- Turbo caches build outputs
- Docker Compose for local SQL Server

## Version Control
