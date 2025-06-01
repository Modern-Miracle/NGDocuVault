# Smart Contract Documentation

The Docu smart contracts provide on-chain document verification, DID management, and access control.

## 📑 Table of Contents

- [Overview](./overview.md)
- [Contract Architecture](./architecture.md)
- [Deployment Guide](./deployment.md)
- [Contract Interfaces](./interfaces.md)
- [Events](./events.md)
- [Testing](./testing.md)
- [Gas Optimization](./gas-optimization.md)
- [Security](./security.md)

## 📜 Core Contracts

### DocuVault.sol
Main document verification contract with:
- Document registration and verification
- Access control and sharing
- Consent management
- Event emission for indexing

### DidRegistry.sol
Decentralized Identifier management:
- DID registration and updates
- DID document storage
- Controller management
- DID resolution

### DidAuth.sol
Authentication and authorization:
- Role-based access control
- Credential verification
- Permission management
- Integration with other contracts

### DidIssuer.sol
Credential issuance:
- Issue verifiable credentials
- Manage trusted issuers
- Credential revocation

### DidVerifier.sol
Credential verification:
- Verify credential authenticity
- Check issuer authorization
- Validate credential status

## 🔐 ZKP Verifiers

### AgeVerifier.sol
Zero-knowledge proof verification for age-based credentials

### FhirVerifier.sol
Healthcare data verification using FHIR standards

### HashVerifier.sol
Generic hash-based verification

## 🚀 Deployment

```bash
# Compile contracts
pnpm build

# Run tests
pnpm test

# Deploy to localhost
pnpm deploy

# Generate TypeScript types
pnpm typechain
```

## 📊 Gas Optimization

- Efficient storage patterns
- Batch operations support
- Event optimization
- Circuit-specific optimizations

## 🔍 Recent Updates

### Role Management
- Implemented proper role hash generation
- Added role constants (ADMIN_ROLE, ISSUER_ROLE, etc.)
- Enhanced access control checks
- Improved event emissions

### Deployment Scripts
- Created registration scripts for all roles
- Added setup script for initial admin
- Improved error handling and decoding

See [Contract Interfaces](./interfaces.md) for detailed API documentation.