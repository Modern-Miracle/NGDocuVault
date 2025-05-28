# Smart Contract Documentation

The Docu smart contracts provide on-chain document verification, DID management, and access control.

## 📑 Table of Contents

### Architecture & Design
- [Overview](./overview.md) - System overview and key features
- [Contract Architecture](./architecture.md) - Technical architecture and design patterns

### Core Contracts
- [DocuVault](./contracts/docu-vault.md) - Main document verification contract
- [DidRegistry](./contracts/did-registry.md) - Decentralized identifier management
- [DidAuth](./contracts/did-auth.md) - Authentication and authorization
- [DidIssuer](./contracts/did-issuer.md) - Credential issuance
- [DidVerifier](./contracts/did-verifier.md) - Credential verification

### ZKP Verifiers
- [ZKP Verifiers Overview](./zkp-verifiers.md) - Zero-knowledge proof contracts
- [AgeVerifier](./contracts/age-verifier.md) - Age verification
- [FhirVerifier](./contracts/fhir-verifier.md) - Healthcare data verification
- [HashVerifier](./contracts/hash-verifier.md) - Generic hash verification

### Guides
- [Deployment Guide](./deployment.md) - Contract deployment instructions
- [Gas Optimization](./gas-optimization.md) - Gas efficiency techniques
- [Security](./security.md) - Security considerations
- [Testing](./testing.md) - Testing strategies

### Reference
- [Contract Interfaces](./interfaces.md) - ABI and interface documentation
- [Events](./events.md) - Event definitions and usage
- [Interaction Examples](./examples.md) - Code examples

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    DidAuth      │────▶│   DidRegistry   │◀────│   DidIssuer     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DocuVault     │────▶│   DidVerifier   │────▶│  ZKP Verifiers  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📜 Contract Summary

### DocuVault
- **Purpose**: Document lifecycle management
- **Key Features**: Registration, verification, consent management
- **Gas Cost**: ~100k for registration

### DidRegistry
- **Purpose**: DID management
- **Key Features**: DID CRUD operations, public key management
- **Gas Cost**: ~150k for registration

### DidAuth
- **Purpose**: Role-based access control
- **Key Features**: Role management, credential-based auth
- **Dependencies**: DidRegistry, DidIssuer, DidVerifier

### DidIssuer
- **Purpose**: Credential issuance tracking
- **Key Features**: On-chain credential registry
- **Gas Cost**: ~50k per issuance

### DidVerifier
- **Purpose**: Credential verification
- **Key Features**: Trusted issuer management
- **Gas Cost**: ~10k per verification

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm build

# Run tests
pnpm test

# Deploy to localhost
pnpm deploy

# Generate TypeScript types
pnpm typechain
```

## 🔧 Development Commands

```bash
# Start local node
pnpm dev:contract

# Run coverage
pnpm coverage

# Setup roles
pnpm setup:roles

# Register admin
pnpm register:admin

# Verify roles
pnpm verify:roles
```

## 📊 Gas Optimization

Key optimization techniques:
- Struct packing for efficient storage
- Batch operations for multiple transactions
- Event-driven architecture for off-chain data
- Efficient mapping structures

See [Gas Optimization Guide](./gas-optimization.md) for details.

## 🔒 Security

Security features:
- OpenZeppelin contracts for standard implementations
- Role-based access control
- Pausable functionality
- Comprehensive error handling

See [Security Documentation](./security.md) for details.

## 🧪 Testing

Test coverage includes:
- Unit tests for each contract
- Integration tests for contract interactions
- Gas usage reporting
- Security analysis

See [Testing Guide](./testing.md) for details.

## 📈 Recent Updates

### Role Management Enhancement
- Proper role hash generation using keccak256
- Added role constants (ADMIN_ROLE, ISSUER_ROLE, etc.)
- Enhanced access control checks
- Improved event emissions

### Deployment Improvements
- Automated role registration scripts
- Initial admin setup automation
- Enhanced error decoding
- Deployment verification scripts

## 🔗 External Dependencies

- OpenZeppelin Contracts v5.2.0
- Circomlib v2.0.5 (for ZKP circuits)
- Hardhat development environment

## 📝 License

MIT License - see contract headers for details