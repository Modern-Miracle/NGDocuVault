# API Response Schemas

## Overview

This document defines the standard response schemas used across all Docu API endpoints. All responses follow a consistent structure to ensure predictable client-side handling.

## Standard Response Format

### Success Response

All successful API responses follow this structure:

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  metadata?: ResponseMetadata;
}

interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
}
```

**Example**:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example"
  },
  "message": "Operation completed successfully",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_abc123",
    "version": "1.0.0"
  }
}
```

### Error Response

All error responses follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    stack?: string; // Only in development
  };
  metadata?: ResponseMetadata;
}
```

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

## Authentication Schemas

### Login/Verify Response

```typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserInfo;
}

interface UserInfo {
  address: string;
  did?: string;
  roles: string[];
  profile?: UserProfile;
}

interface UserProfile {
  displayName?: string;
  avatar?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Session Response

```typescript
interface SessionResponse {
  user: UserInfo;
  session: {
    id: string;
    createdAt: string;
    expiresAt: string;
    lastActivity: string;
  };
  authMethod: 'siwe' | 'jwt';
}
```

### Nonce Response

```typescript
interface NonceResponse {
  nonce: string;
  expiresAt: string;
  domain: string;
  version: string;
}
```

## DID Schemas

### DID Document Response

```typescript
interface DIDDocumentResponse {
  "@context": string[];
  id: string;
  controller: string | string[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: ServiceEndpoint[];
}

interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyHex?: string;
  publicKeyBase58?: string;
  blockchainAccountId?: string;
}

interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | Record<string, any>;
}
```

### DID Resolution Response

```typescript
interface DIDResolutionResponse {
  didDocument: DIDDocumentResponse;
  didDocumentMetadata: {
    created: string;
    updated: string;
    versionId: string;
    deactivated?: boolean;
  };
  didResolutionMetadata: {
    contentType: string;
    error?: string;
    errorMessage?: string;
  };
}
```

## Credential Schemas

### Verifiable Credential Response

```typescript
interface VerifiableCredentialResponse {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof: ProofObject;
  credentialStatus?: CredentialStatus;
}

interface CredentialSubject {
  id: string;
  [key: string]: any; // Dynamic claims
}

interface ProofObject {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  proofValue?: string;
}

interface CredentialStatus {
  id: string;
  type: string;
  revocationListIndex?: string;
  revocationListCredential?: string;
}
```

### Credential Verification Response

```typescript
interface CredentialVerificationResponse {
  isValid: boolean;
  credential: VerifiableCredentialResponse;
  verificationResult: {
    checks: VerificationCheck[];
    warnings: VerificationWarning[];
    errors: VerificationError[];
  };
}

interface VerificationCheck {
  check: 'signature' | 'issuer' | 'expiration' | 'revocation' | 'schema';
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

interface VerificationWarning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface VerificationError {
  code: string;
  message: string;
  fatal: boolean;
}
```

## IPFS Schemas

### Upload Response

```typescript
interface IPFSUploadResponse {
  cid: string;
  size: number;
  contentHash: string;
  encrypted: boolean;
  timestamp: string;
  gateway?: string;
  encryptionMetadata?: {
    algorithm: string;
    keyId: string;
    iv: string;
  };
}
```

### Retrieval Response

```typescript
interface IPFSDataResponse {
  document: {
    documentType: string;
    content: string; // Base64
    fileName: string;
    contentType: string;
    fileSize: number;
  };
  metadata: {
    name: string;
    owner: string;
    type: string;
    description?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
    permissions?: {
      read: string[];
      write: string[];
    };
  };
  encrypted?: boolean;
}
```

### Batch Operation Response

```typescript
interface BatchOperationResponse<T> {
  results: BatchResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  manifest?: {
    cid: string;
    files: number;
    totalSize: number;
  };
}

interface BatchResult<T> {
  index?: number;
  identifier: string; // fileName or cid
  success: boolean;
  data?: T;
  error?: string;
}
```

## Pagination Schema

For endpoints that return lists:

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

**Example**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

## Blockchain Transaction Schemas

### Transaction Response

```typescript
interface TransactionResponse {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: string;
  effectiveGasPrice: string;
  status: 'success' | 'failed';
  logs: EventLog[];
}

interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  event?: string;
  args?: any;
}
```

### Contract Call Response

```typescript
interface ContractCallResponse<T = any> {
  result: T;
  transaction?: TransactionResponse;
  gasEstimate?: string;
}
```

## Status and Health Check Schemas

### Health Check Response

```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    [serviceName: string]: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  lastCheck: string;
  details?: any;
}
```

**Example**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "up",
      "latency": 5,
      "lastCheck": "2024-01-01T00:00:00Z"
    },
    "ipfs": {
      "status": "up",
      "latency": 120,
      "lastCheck": "2024-01-01T00:00:00Z"
    },
    "blockchain": {
      "status": "up",
      "latency": 250,
      "lastCheck": "2024-01-01T00:00:00Z",
      "details": {
        "network": "mainnet",
        "blockNumber": 19234567
      }
    }
  }
}
```

## Validation Error Schemas

### Field Validation Error

```typescript
interface ValidationErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationDetail[];
  };
}

interface ValidationDetail {
  field: string;
  value?: any;
  message: string;
  code: string;
}
```

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "value": "invalid-email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "value": -5,
        "message": "Must be a positive number",
        "code": "min_value"
      }
    ]
  }
}
```

## WebSocket Event Schemas

For real-time updates:

```typescript
interface WebSocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
  id: string;
}

interface SubscriptionResponse {
  subscriptionId: string;
  event: string;
  filter?: any;
  createdAt: string;
}
```

## Rate Limit Response

When rate limited:

```typescript
interface RateLimitResponse {
  success: false;
  error: {
    code: 'RATE_LIMITED';
    message: string;
    details: {
      limit: number;
      remaining: number;
      reset: string;
      retryAfter: number;
    };
  };
}
```

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": "2024-01-01T01:00:00Z",
      "retryAfter": 3600
    }
  }
}
```

## Schema Validation

All API responses are validated against these schemas using JSON Schema validation. The schemas are available at:

```
https://api.docu.io/schemas/v1/
```

### Example Schema Reference

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "https://api.docu.io/schemas/v1/success-response.json"
}
```

## Content Types

All API responses use the following content types:

| Content Type | Usage |
|--------------|-------|
| `application/json` | Standard JSON responses |
| `application/ld+json` | JSON-LD responses (DIDs, VCs) |
| `application/problem+json` | RFC 7807 problem details |

## HTTP Status Codes

| Status Code | Meaning | Used For |
|-------------|---------|----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate) |
| 410 | Gone | Resource permanently deleted |
| 413 | Payload Too Large | Request body too large |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Server errors |
| 502 | Bad Gateway | External service errors |
| 503 | Service Unavailable | Maintenance/overload |

## Response Headers

Standard headers included in responses:

```http
X-Request-ID: req_abc123
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704067200
X-Response-Time: 123ms
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache, no-store, must-revalidate
```