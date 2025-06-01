# NGDocuVault

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Built with](https://img.shields.io/badge/Built%20with-Turborepo-blueviolet)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

**Creating an inclusive, blockchain-enabled document management system for immigrants, ensuring data sovereignty and seamless identity verification across EU, US, and Canadian standards, with Docu Assist, an AI-driven multilingual and barrier-free interface for legal guidance.**

## About the Project

NGDocuVault is an open-source decentralized document management platform developed as part of the **NGI Sargasso** program. This project addresses the critical need for secure, privacy-preserving document verification and management for immigrants and refugees navigating complex bureaucratic processes across different jurisdictions.

### Project Partners

- **[Hora e.V.](https://hora-ev.eu)** - Main development organization
- **[Modern Miracle](https://modern-miracle.com)** - Technology collaboration partner
- **NGI Sargasso** - Funding and support through the Next Generation Internet initiative

### Key Features

- **🔐 Decentralized Identity Management**: SIWE (Sign-In with Ethereum) authentication with DID support
- **📄 Secure Document Storage**: IPFS-based storage with client-side encryption
- **🛡️ Privacy-Preserving Verification**: Zero-knowledge proofs for document verification without content disclosure
- **🌍 Multi-Jurisdictional Compliance**: Support for EU, US, and Canadian identity verification standards
- **🤖 Docu Assist**: AI-powered multilingual assistant for legal guidance and document navigation
- **👥 Role-Based Access Control**: Granular permissions for Admins, Issuers, Verifiers, and Holders
- **📊 Blockchain Verification**: Immutable document registration and verification on Ethereum

## Architecture

NGDocuVault is built as a monorepo using Turborepo, consisting of:

### Applications

- **`apps/web`** - React frontend with Web3 integration and Docu Assist
- **`apps/api`** - Express.js backend with IPFS and blockchain integration
- **`apps/contract`** - Solidity smart contracts for DID and document management
- **`apps/docs`** - Next.js documentation site (in development)

### Shared Packages

- **`@docu/abi`** - Smart contract ABIs and TypeScript types
- **`@docu/auth`** - Authentication utilities and SIWE integration
- **`@docu/crypto`** - Cryptographic utilities for encryption/decryption
- **`@docu/database`** - Database schemas and migration utilities
- **`@docu/ipfs`** - IPFS integration and file management
- **`@docu/types`** - Shared TypeScript type definitions
- **`@docu/ui`** - Reusable UI components
- **`@docu/utils`** - Common utility functions
- **`@workspace/*`** - Configuration packages (ESLint, TypeScript, etc.)

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker (for local database)
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NGDocuVault-eu/ng-docuvault.git
   cd ng-docuvault
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment files**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/contract/.env.example apps/contract/.env
   ```

4. **Configure your environment variables** (see [Environment Configuration](#environment-configuration))

### Development

#### Option 1: Quick Start (Recommended)
```bash
# Start all essential services
./run-simple.sh
```

#### Option 2: Manual Setup
```bash
# Start local blockchain
cd apps/contract && pnpm dev:contract

# Deploy contracts (in new terminal)
cd apps/contract && pnpm deploy

# Start database
cd apps/api && pnpm db:prepare

# Start API server
cd apps/api && pnpm dev:api

# Start web application
cd apps/web && pnpm dev
```

#### Option 3: Full Stack with Graph Node
```bash
# Requires Docker
./run-app.sh
```

### Available Scripts

```bash
# Development
pnpm dev              # Start all applications
pnpm build            # Build all applications
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier

# Individual applications
pnpm dev:web          # Start web app only
pnpm dev:api          # Start API only
pnpm dev:contract     # Start blockchain node only
```

## Environment Configuration

### Required Services

- **SQL Server**: For off-chain data storage
- **IPFS Node**: For document storage (or use Web3.Storage/Pinata)
- **Ethereum Node**: Local Hardhat or public testnet/mainnet
- **Azure Key Vault** (optional): For production key management

### Key Environment Variables

```bash
# Database
DATABASE_URL="Server=localhost,1433;Database=ngdocuvault;..."

# Blockchain
LOCAL_RPC_URL="http://localhost:8545"
PRIVATE_KEY="your-deployer-private-key"

# IPFS Storage
WEB3_STORAGE_TOKEN="your-web3-storage-token"
PINATA_JWT="your-pinata-jwt-token"

# Security
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"

# Azure (Production)
AZURE_CLIENT_ID="your-azure-client-id"
AZURE_TENANT_ID="your-azure-tenant-id"
```

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** primitives
- **ethers.js v6** for Web3 integration
- **React Query** for state management

### Backend
- **Express.js** with TypeScript
- **SQL Server** for data persistence
- **IPFS** (Helia + Web3.Storage/Pinata)
- **JWT** authentication with SIWE
- **Azure Key Vault** integration

### Blockchain
- **Solidity 0.8.20** smart contracts
- **Hardhat** development environment
- **OpenZeppelin** contract libraries
- **Circom** for zero-knowledge circuits

## Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Issue reporting guidelines

## Documentation

- **[API Documentation](docs/api/)** - REST API endpoints and schemas
- **[Smart Contract Documentation](docs/contract/)** - Contract architecture and deployment
- **[Frontend Documentation](docs/web/)** - Component architecture and user flows
- **[Deployment Guide](docs/deployment/)** - Production deployment instructions

## Security

NGDocuVault takes security seriously:

- **Client-side encryption** before IPFS storage
- **Zero-knowledge proofs** for privacy-preserving verification
- **Multi-signature** wallet support for admin operations
- **Regular security audits** (planned)

Please report security vulnerabilities to security@hora-ev.eu

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See [LICENSE](LICENSE) for the full license text.

The AGPL-3.0 ensures that any network use of this software makes the source code available to users, preserving the open-source nature of improvements and modifications.

## Acknowledgments

- **NGI Sargasso** for funding and support
- **Hora e.V.** and **Modern Miracle** for development and collaboration
- The open-source community for tools and libraries that make this project possible

## Support

- **Documentation**: [Full documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/NGDocuVault-eu/ng-docuvault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NGDocuVault-eu/ng-docuvault/discussions)
- **Email**: contact@hora-ev.eu

---

**NGDocuVault** - Empowering immigrants with secure, sovereign digital identity and document management.