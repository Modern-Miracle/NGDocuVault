# API Documentation

The Docu API provides backend services for document verification, authentication, and IPFS integration.

## 📑 Table of Contents

### Core Documentation
- [Overview](./overview.md) - Architecture, features, and getting started
- [Authentication](./authentication.md) - SIWE and JWT authentication flows
- [Response Schemas](./response-schemas.md) - Standard API response formats
- [Error Handling](./error-handling.md) - Error codes and handling strategies

### API Endpoints
- [Authentication Endpoints](./authentication.md) - Login, logout, session management
- [DID Management](./did-management.md) - Create, update, and resolve DIDs
- [Credentials](./credentials.md) - Issue and verify credentials
- [IPFS Integration](./ipfs-endpoints.md) - Document storage and retrieval
- [IPFS Service Details](./ipfs.md) - IPFS implementation and architecture

### Improvements
- [Improvement Suggestions](./improvement/suggestions.md) - Recommended enhancements

### Additional Resources
- [Database Schema](./database-schema.md) - Database structure and models
- [Services](./services.md) - Service layer documentation
- [Middleware](./middleware.md) - Custom middleware documentation
- [Testing](./testing.md) - Testing strategies and guidelines
- [Configuration Guide](./configuration.md) - Environment setup

## 🔑 Key Features

- **SIWE Authentication**: Sign-In with Ethereum for secure authentication
- **JWT Token Management**: Access and refresh token system  
- **IPFS Integration**: Decentralized document storage via Pinata
- **Smart Contract Interaction**: Blockchain integration via ethers.js
- **Role-Based Access Control**: Fine-grained permissions system
- **Session Management**: Secure session handling with SQL Server
- **Verifiable Credentials**: W3C-compliant credential issuance
- **DID Management**: Decentralized identifier support

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start database
pnpm db:start

# Initialize database
pnpm db:setup

# Start development server
pnpm dev:api

# Run tests
pnpm test
```

## 📋 API Base URLs

```
Development: http://localhost:3001/api/v1
Production: https://api.docu.io/api/v1
```

## 🔧 Environment Variables

Key environment variables required:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=<sql-server-connection-string>

# Authentication
JWT_SECRET=<jwt-secret>
SESSION_SECRET=<session-secret>

# IPFS
PINATA_API_JWT=<pinata-jwt-token>

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
```

## 📚 API Documentation Tools

- **Postman Collection**: Available in `/docs/api/postman`
- **OpenAPI Spec**: Coming soon (see [improvements](./improvement/suggestions.md))
- **Interactive Explorer**: Planned feature

## 🔒 Security

- All endpoints require HTTPS in production
- Authentication required for most endpoints
- Rate limiting enforced
- Request signing for critical operations (planned)

## 📞 Support

- GitHub Issues: [github.com/docu/api/issues](https://github.com/docu/api/issues)
- Email: api-support@docu.io
- Documentation: [docs.docu.io](https://docs.docu.io)