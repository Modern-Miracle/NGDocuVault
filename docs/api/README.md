# API Documentation

The Docu API provides backend services for document verification, authentication, and IPFS integration.

## 📑 Table of Contents

- [Overview](./overview.md)
- [Authentication](./authentication.md)
- [Endpoints](./endpoints.md)
- [Error Handling](./error-handling.md)
- [Database Schema](./database-schema.md)
- [Services](./services.md)
- [Middleware](./middleware.md)
- [Testing](./testing.md)

## 🔑 Key Features

- **SIWE Authentication**: Sign-In with Ethereum for secure authentication
- **JWT Token Management**: Access and refresh token system
- **IPFS Integration**: Document storage and retrieval
- **Smart Contract Interaction**: Blockchain integration via ethers.js
- **Role-Based Access Control**: Fine-grained permissions
- **Session Management**: Secure session handling with SQL Server

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:api

# Run tests
pnpm test
```

## 📋 API Endpoints Overview

### Authentication
- `POST /api/auth/nonce` - Generate SIWE nonce
- `POST /api/auth/verify` - Verify signature and create session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - End session

### DID Management
- `GET /api/did/:address` - Get DID for address
- `POST /api/did/register` - Register new DID
- `PUT /api/did/:did` - Update DID document

### Document Operations
- `POST /api/ipfs/upload` - Upload document to IPFS
- `GET /api/ipfs/:cid` - Retrieve document from IPFS
- `POST /api/documents/verify` - Verify document authenticity

### Credentials
- `POST /api/credentials/issue` - Issue new credential
- `GET /api/credentials/:id` - Get credential details
- `POST /api/credentials/verify` - Verify credential

## 🔧 Configuration

See [Configuration Guide](./configuration.md) for environment variables and setup.