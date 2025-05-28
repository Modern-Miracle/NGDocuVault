# API Overview

## Introduction

The Docu API is a RESTful service that provides secure document management, authentication, and blockchain integration capabilities. Built with Express.js and TypeScript, it serves as the backend for the Docu decentralized document verification platform.

## Architecture

### Technology Stack

- **Framework**: Express.js with TypeScript
- **Authentication**: SIWE (Sign-In with Ethereum) + JWT
- **Database**: SQL Server with TypeORM
- **Storage**: IPFS via Pinata
- **Blockchain**: Ethereum (ethers.js)
- **Session Management**: express-session with SQL store
- **Security**: Helmet.js, CORS, rate limiting

### Core Components

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  API Layer  │────▶│  Services   │
│  (React App)│     │  (Express)  │     │   Layer     │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Middleware  │     │  Database   │
                    │    Layer     │     │   (SQL)     │
                    └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Blockchain  │
                                        │  (Ethereum) │
                                        └─────────────┘
```

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.docu.io/api/v1
```

## API Versioning

The API uses URL path versioning. Current version: `v1`

All endpoints are prefixed with `/api/v1/`

## Authentication Methods

### 1. SIWE Authentication (Primary)

Sign-In with Ethereum provides Web3-native authentication:

```
POST /api/v1/auth/siwe/verify
```

### 2. JWT Authentication (Legacy)

Traditional JWT-based authentication for backwards compatibility:

```
POST /api/v1/auth/jwt/authenticate
```

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Request-ID: <unique-request-id>
```

### Standard Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Core Features

### 1. Document Management

- Upload documents to IPFS
- Retrieve documents by CID
- Verify document authenticity
- Manage document access permissions

### 2. DID Management

- Create and manage Decentralized Identifiers
- Update DID documents
- Resolve DIDs to get associated data

### 3. Credential System

- Issue verifiable credentials
- Verify credential authenticity
- Manage credential lifecycle

### 4. Blockchain Integration

- Interact with smart contracts
- Register documents on-chain
- Verify on-chain data

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Standard endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute

## Security Features

### 1. Authentication & Authorization

- Multi-factor authentication support
- Role-based access control (RBAC)
- Session management with secure cookies

### 2. Data Protection

- End-to-end encryption for sensitive data
- HTTPS enforcement in production
- Input validation and sanitization

### 3. API Security

- CORS configuration for allowed origins
- Helmet.js for security headers
- Request signing for critical operations

## Performance Considerations

### Caching Strategy

- Redis caching for frequently accessed data
- ETags for conditional requests
- CDN integration for static assets

### Optimization Techniques

- Database query optimization
- Connection pooling
- Asynchronous processing for heavy operations

## Monitoring & Logging

### Logging Levels

- **Error**: Critical errors requiring immediate attention
- **Warn**: Warning conditions that should be reviewed
- **Info**: General informational messages
- **Debug**: Detailed debugging information

### Metrics Tracked

- API response times
- Error rates by endpoint
- Authentication success/failure rates
- IPFS upload/retrieval performance

## Development Tools

### API Documentation

- OpenAPI/Swagger specification available
- Postman collection for testing
- Interactive API explorer

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## Environment Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=<connection-string>
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=<password>
DB_DATABASE=docu_db

# Authentication
JWT_SECRET=<jwt-secret>
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
SESSION_SECRET=<session-secret>

# IPFS
PINATA_API_JWT=<pinata-jwt>
IPFS_GATEWAY_URL=gateway.pinata.cloud

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=<deployment-private-key>

# Encryption
ENCRYPTION_KEY=<32-character-key>
```

## API Lifecycle

### Request Flow

1. **Request Reception**: Express server receives HTTP request
2. **Middleware Processing**: 
   - CORS validation
   - Rate limiting check
   - Authentication verification
   - Request validation
3. **Route Handling**: Request routed to appropriate controller
4. **Business Logic**: Service layer processes the request
5. **Database Operations**: Data persistence/retrieval
6. **Response Formation**: Standard response format applied
7. **Response Delivery**: JSON response sent to client

### Error Handling Flow

1. **Error Detection**: Error thrown in any layer
2. **Error Propagation**: Bubbles up to error middleware
3. **Error Classification**: Categorized by type and severity
4. **Error Logging**: Logged with appropriate context
5. **Error Response**: Formatted error sent to client

## Best Practices

### API Design Principles

1. **RESTful Design**: Follow REST conventions
2. **Idempotency**: Ensure safe retry of requests
3. **Versioning**: Maintain backward compatibility
4. **Documentation**: Keep docs synchronized with code

### Security Guidelines

1. **Input Validation**: Validate all incoming data
2. **Output Encoding**: Properly encode responses
3. **Authentication**: Verify identity on every request
4. **Authorization**: Check permissions before operations

### Performance Guidelines

1. **Pagination**: Implement for list endpoints
2. **Filtering**: Support query parameters
3. **Partial Responses**: Allow field selection
4. **Batch Operations**: Support bulk operations

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check allowed origins configuration
2. **Authentication Failures**: Verify token expiration
3. **Rate Limiting**: Check request frequency
4. **Database Timeouts**: Review connection pool settings

### Debug Mode

Enable debug logging:

```bash
DEBUG=docu:* npm run dev
```

## Support

For API support and questions:

- Documentation: [https://docs.docu.io](https://docs.docu.io)
- GitHub Issues: [https://github.com/docu/api/issues](https://github.com/docu/api/issues)
- Email: api-support@docu.io