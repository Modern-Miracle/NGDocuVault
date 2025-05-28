# Error Handling Documentation

## Overview

The Docu API implements a comprehensive error handling system that provides consistent, informative error responses across all endpoints. This document describes error types, handling strategies, and best practices for API consumers.

## Error Response Format

All errors follow a standardized format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: any;          // Additional context-specific details
    field?: string;         // Field name for validation errors
    stack?: string;         // Stack trace (development only)
  };
  metadata?: {
    timestamp: string;      // ISO 8601 timestamp
    requestId: string;      // Unique request identifier
    path: string;          // API endpoint path
    method: string;        // HTTP method
  };
}
```

## Error Categories

### 1. Client Errors (4xx)

#### Validation Errors (400)

Occur when request data fails validation.

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
      }
    ]
  }
}
```

**Common Validation Error Codes**:
- `MISSING_FIELD` - Required field is missing
- `INVALID_FORMAT` - Field format is incorrect
- `INVALID_TYPE` - Field type is wrong
- `MIN_LENGTH` - String too short
- `MAX_LENGTH` - String too long
- `MIN_VALUE` - Number below minimum
- `MAX_VALUE` - Number above maximum
- `PATTERN_MISMATCH` - Regex pattern not matched

#### Authentication Errors (401)

Occur when authentication is missing or invalid.

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "The provided authentication token is invalid",
    "details": {
      "reason": "Token signature verification failed",
      "tokenType": "Bearer"
    }
  }
}
```

**Authentication Error Codes**:
- `AUTH_MISSING_TOKEN` - No authentication token provided
- `AUTH_INVALID_TOKEN` - Token is malformed or invalid
- `AUTH_EXPIRED_TOKEN` - Token has expired
- `AUTH_INVALID_SIGNATURE` - Signature verification failed
- `AUTH_INVALID_NONCE` - Nonce is invalid or expired
- `AUTH_USER_NOT_FOUND` - User associated with token not found

#### Authorization Errors (403)

Occur when user lacks required permissions.

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You do not have permission to perform this action",
    "details": {
      "required": ["admin", "issuer"],
      "current": ["holder"],
      "action": "issue_credential"
    }
  }
}
```

**Authorization Error Codes**:
- `INSUFFICIENT_PERMISSIONS` - Missing required permissions
- `ROLE_REQUIRED` - Specific role needed
- `RESOURCE_ACCESS_DENIED` - No access to specific resource
- `OPERATION_NOT_ALLOWED` - Operation forbidden for user

#### Not Found Errors (404)

Occur when requested resource doesn't exist.

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {
      "resource": "credential",
      "id": "cred_123456"
    }
  }
}
```

**Not Found Error Codes**:
- `RESOURCE_NOT_FOUND` - Generic resource not found
- `DID_NOT_FOUND` - DID doesn't exist
- `CREDENTIAL_NOT_FOUND` - Credential not found
- `CID_NOT_FOUND` - IPFS CID not found
- `USER_NOT_FOUND` - User not found

#### Conflict Errors (409)

Occur when request conflicts with current state.

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "A resource with this identifier already exists",
    "details": {
      "resource": "did",
      "identifier": "did:ethr:0x123..."
    }
  }
}
```

**Conflict Error Codes**:
- `RESOURCE_ALREADY_EXISTS` - Duplicate resource
- `DID_ALREADY_REGISTERED` - DID already exists
- `OPERATION_IN_PROGRESS` - Conflicting operation running
- `STATE_CONFLICT` - Invalid state transition

#### Rate Limit Errors (429)

Occur when rate limits are exceeded.

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please retry after some time.",
    "details": {
      "limit": 100,
      "window": "1h",
      "remaining": 0,
      "reset": "2024-01-01T01:00:00Z",
      "retryAfter": 3600
    }
  }
}
```

### 2. Server Errors (5xx)

#### Internal Server Errors (500)

Occur due to unexpected server issues.

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": {
      "requestId": "req_abc123",
      "support": "contact support@docu.io with this request ID"
    }
  }
}
```

**Server Error Codes**:
- `INTERNAL_ERROR` - Generic server error
- `DATABASE_ERROR` - Database operation failed
- `BLOCKCHAIN_ERROR` - Blockchain interaction failed
- `ENCRYPTION_ERROR` - Encryption/decryption failed
- `CONFIGURATION_ERROR` - Server misconfiguration

#### Bad Gateway Errors (502)

Occur when external services fail.

```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_SERVICE_ERROR",
    "message": "External service is unavailable",
    "details": {
      "service": "ipfs",
      "endpoint": "gateway.pinata.cloud",
      "timeout": 30000
    }
  }
}
```

#### Service Unavailable Errors (503)

Occur during maintenance or overload.

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service is temporarily unavailable",
    "details": {
      "reason": "maintenance",
      "estimatedDowntime": "30m",
      "maintenanceEnd": "2024-01-01T02:00:00Z"
    }
  }
}
```

## Domain-Specific Errors

### Blockchain Errors

```typescript
interface BlockchainError {
  code: string;
  message: string;
  details: {
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    revertReason?: string;
    contractAddress?: string;
    method?: string;
  };
}
```

**Blockchain Error Codes**:
- `INSUFFICIENT_GAS` - Not enough gas for transaction
- `NONCE_TOO_LOW` - Transaction nonce too low
- `TRANSACTION_REVERTED` - Smart contract reverted
- `CONTRACT_NOT_FOUND` - Contract address invalid
- `INVALID_SIGNATURE` - Transaction signature invalid

### IPFS Errors

```typescript
interface IPFSError {
  code: string;
  message: string;
  details: {
    cid?: string;
    gateway?: string;
    operation?: string;
    fileSize?: number;
  };
}
```

**IPFS Error Codes**:
- `IPFS_UPLOAD_FAILED` - Failed to upload to IPFS
- `IPFS_RETRIEVAL_FAILED` - Failed to retrieve from IPFS
- `IPFS_PINNING_FAILED` - Failed to pin content
- `IPFS_SIZE_EXCEEDED` - File size limit exceeded
- `IPFS_GATEWAY_TIMEOUT` - Gateway request timed out

### DID Errors

```typescript
interface DIDError {
  code: string;
  message: string;
  details: {
    did?: string;
    method?: string;
    reason?: string;
  };
}
```

**DID Error Codes**:
- `DID_INVALID_FORMAT` - DID format is invalid
- `DID_METHOD_NOT_SUPPORTED` - DID method not supported
- `DID_DEACTIVATED` - DID has been deactivated
- `DID_RESOLUTION_FAILED` - Failed to resolve DID

## Error Handling Best Practices

### For API Consumers

1. **Always Check Success Flag**
```javascript
const response = await fetch('/api/v1/endpoint');
const data = await response.json();

if (!data.success) {
  handleError(data.error);
}
```

2. **Handle Specific Error Codes**
```javascript
function handleError(error) {
  switch (error.code) {
    case 'AUTH_EXPIRED_TOKEN':
      return refreshToken();
    case 'RATE_LIMITED':
      return retryAfter(error.details.retryAfter);
    case 'VALIDATION_ERROR':
      return showValidationErrors(error.details);
    default:
      return showGenericError(error.message);
  }
}
```

3. **Implement Retry Logic**
```javascript
async function retryableRequest(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.success) return data;
      
      if (response.status >= 500 || error.code === 'NETWORK_ERROR') {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      
      throw new Error(data.error.message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

4. **Log Request IDs**
```javascript
if (!data.success && data.metadata?.requestId) {
  console.error(`Request failed: ${data.metadata.requestId}`);
  // Include in support tickets
}
```

### Error Recovery Strategies

#### Authentication Errors
1. Check if token is expired
2. Attempt token refresh
3. If refresh fails, redirect to login

#### Rate Limiting
1. Check `retryAfter` header
2. Implement exponential backoff
3. Queue requests if necessary

#### Network Errors
1. Retry with exponential backoff
2. Fall back to cached data if available
3. Show offline indicator

#### Validation Errors
1. Highlight specific fields
2. Show field-level error messages
3. Prevent form submission

## Monitoring and Alerting

### Error Metrics

The API tracks:
- Error rate by endpoint
- Error rate by type
- Response time percentiles
- Failed authentication attempts

### Alert Thresholds

- Error rate > 5% - Warning
- Error rate > 10% - Critical
- 5xx errors > 1% - Critical
- Authentication failures > 100/min - Security alert

## Development vs Production

### Development Environment

In development, errors include:
- Stack traces
- Detailed internal errors
- Database query information
- Full request/response logging

### Production Environment

In production, errors:
- Omit stack traces
- Sanitize internal details
- Include support contact
- Log to monitoring services

## Error Code Reference

### Complete Error Code List

| Code | HTTP Status | Description |
|------|-------------|-------------|
| **Validation Errors** | 400 | |
| VALIDATION_ERROR | 400 | Generic validation failure |
| MISSING_FIELD | 400 | Required field missing |
| INVALID_FORMAT | 400 | Invalid field format |
| INVALID_TYPE | 400 | Wrong field type |
| **Authentication Errors** | 401 | |
| AUTH_MISSING_TOKEN | 401 | No token provided |
| AUTH_INVALID_TOKEN | 401 | Invalid token |
| AUTH_EXPIRED_TOKEN | 401 | Token expired |
| AUTH_INVALID_SIGNATURE | 401 | Invalid signature |
| **Authorization Errors** | 403 | |
| INSUFFICIENT_PERMISSIONS | 403 | Missing permissions |
| ROLE_REQUIRED | 403 | Missing required role |
| RESOURCE_ACCESS_DENIED | 403 | No resource access |
| **Not Found Errors** | 404 | |
| RESOURCE_NOT_FOUND | 404 | Resource not found |
| DID_NOT_FOUND | 404 | DID not found |
| CREDENTIAL_NOT_FOUND | 404 | Credential not found |
| **Conflict Errors** | 409 | |
| RESOURCE_ALREADY_EXISTS | 409 | Duplicate resource |
| STATE_CONFLICT | 409 | Invalid state |
| **Rate Limit Errors** | 429 | |
| RATE_LIMITED | 429 | Too many requests |
| **Server Errors** | 500+ | |
| INTERNAL_ERROR | 500 | Server error |
| DATABASE_ERROR | 500 | Database error |
| BLOCKCHAIN_ERROR | 500 | Blockchain error |
| EXTERNAL_SERVICE_ERROR | 502 | External service down |
| SERVICE_UNAVAILABLE | 503 | Service unavailable |

## Localization

Error messages support localization via `Accept-Language` header:

```http
Accept-Language: es-ES
```

Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La validación de la solicitud falló",
    "details": {
      "field": "email",
      "message": "Debe ser una dirección de correo válida"
    }
  }
}
```

## Support

For persistent errors:
1. Note the request ID from error response
2. Check service status at status.docu.io
3. Contact support with error details:
   - Request ID
   - Error code
   - Timestamp
   - Endpoint affected