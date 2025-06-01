# Guides and Tutorials

Step-by-step guides for common tasks and workflows.

## 📑 Table of Contents

### Getting Started
- [Development Setup](./development-setup.md)
- [First Time Setup](./first-time-setup.md)
- [Environment Configuration](./environment-config.md)

### Development Guides
- [Development Commands](./commands.md)
- [Testing Guide](./testing.md)
- [Debugging Tips](./debugging.md)
- [Code Style Guide](./code-style.md)

### Feature Guides
- [Authentication Flow](./authentication-flow.md)
- [Document Upload](./document-upload.md)
- [User Registration](./user-registration.md)
- [Role Management](./role-management.md)

### Integration Guides
- [Wallet Integration](./wallet-integration.md)
- [IPFS Setup](./ipfs-setup.md)
- [Smart Contract Interaction](./contract-interaction.md)
- [Event Monitoring](./event-monitoring.md)

### Deployment Guides
- [Local Deployment](./local-deployment.md)
- [Testnet Deployment](./testnet-deployment.md)
- [Production Deployment](./production-deployment.md)

## 🚀 Quick Start Guide

### 1. Clone and Install

```bash
git clone <repository>
cd Docu
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env

# Configure your environment variables
# See environment-config.md for details
```

### 3. Start Development

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:api      # API server
pnpm dev:web      # Web app
pnpm dev:contract # Local blockchain
```

### 4. Setup Initial Data

```bash
# Deploy contracts
cd apps/contract
pnpm deploy

# Setup initial admin
pnpm hardhat run scripts/setup-initial-admin.ts --network localhost

# Register test users
pnpm hardhat run scripts/register-all-roles.ts --network localhost
```

## 📋 Common Workflows

### Adding a New User with Admin Role

1. Ensure you have admin access
2. Navigate to User Management page
3. Enter user's Ethereum address
4. Select "ADMIN" role
5. Click "Add User"

### Uploading and Verifying a Document

1. Connect your wallet
2. Navigate to "Register Document"
3. Select and upload file
4. Confirm blockchain transaction
5. Document CID will be stored on-chain

### Managing User Roles

1. Access User Management (admin only)
2. Search for user by DID or address
3. Use role dropdown to grant/revoke roles
4. Changes are recorded on blockchain

## 🔧 Development Tips

- Always run type checking: `pnpm check-types`
- Format code before committing: `pnpm format`
- Run tests before pushing: `pnpm test`
- Check for linting errors: `pnpm lint`

See individual guides for detailed instructions.