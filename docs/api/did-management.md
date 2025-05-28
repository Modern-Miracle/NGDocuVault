# DID Management API Documentation

## Overview

The DID (Decentralized Identifier) Management API provides endpoints for creating, managing, and resolving DIDs on the blockchain. DIDs are globally unique identifiers that enable verifiable, self-sovereign digital identity.

**Note**: DID management endpoints are currently disabled in the codebase but documented here for reference and future implementation.

## DID Structure

A DID in the Docu system follows this format:
```
did:ethr:<network>:<ethereum-address>
```

Example:
```
did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123
```

## Endpoints

### Create DID

Register a new DID on the blockchain.

**Endpoint**: `POST /api/v1/did`

**Request Body**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
  "network": "mainnet"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "document": {
      "@context": ["https://www.w3.org/ns/did/v1"],
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "verificationMethod": [{
        "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#controller",
        "type": "EcdsaSecp256k1RecoveryMethod2020",
        "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
        "blockchainAccountId": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123@eip155:1"
      }],
      "authentication": ["did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#controller"]
    },
    "transaction": "0x..."
  }
}
```

### Resolve DID

Resolve a DID to retrieve its full resolution result including metadata.

**Endpoint**: `GET /api/v1/did/:did`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | The DID to resolve |

**Response**:
```json
{
  "success": true,
  "data": {
    "didDocument": {
      "@context": ["https://www.w3.org/ns/did/v1"],
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "verificationMethod": [],
      "authentication": [],
      "assertionMethod": []
    },
    "didDocumentMetadata": {
      "created": "2024-01-01T00:00:00Z",
      "updated": "2024-01-01T00:00:00Z",
      "versionId": "1"
    },
    "didResolutionMetadata": {
      "contentType": "application/did+ld+json"
    }
  }
}
```

### Get DID Document

Retrieve only the DID document without resolution metadata.

**Endpoint**: `GET /api/v1/did/:did/document`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | The DID to retrieve document for |

**Response**:
```json
{
  "success": true,
  "data": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "verificationMethod": [{
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "publicKeyHex": "0x04..."
    }],
    "authentication": ["did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1"],
    "service": [{
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#profile",
      "type": "ProfileService",
      "serviceEndpoint": "https://profile.example.com/user/0x742d35Cc6634C0532925a3b844Bc9e7595f6E123"
    }]
  }
}
```

### Update DID Document

Update the DID document on the blockchain. Only the DID controller can perform this operation.

**Endpoint**: `PUT /api/v1/did/:did`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | The DID to update |

**Request Body**:
```json
{
  "document": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "verificationMethod": [{
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "publicKeyHex": "0x04..."
    }],
    "service": [{
      "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#email",
      "type": "EmailService",
      "serviceEndpoint": "mailto:user@example.com"
    }]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "document": {
      // Updated document
    },
    "transaction": "0x..."
  }
}
```

### Update Public Key

Update only the public key associated with a DID.

**Endpoint**: `PUT /api/v1/did/:did/publicKey`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | The DID to update |

**Request Body**:
```json
{
  "publicKey": "0x04..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "publicKey": "0x04...",
    "transaction": "0x..."
  }
}
```

### Deactivate DID

Deactivate a DID on the blockchain. This operation is irreversible.

**Endpoint**: `DELETE /api/v1/did/:did`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | The DID to deactivate |

**Response**:
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "transaction": "0x...",
    "status": "deactivated"
  }
}
```

### Get DID by Address

Look up the DID associated with an Ethereum address.

**Endpoint**: `GET /api/v1/did/address/:address`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | Yes | Ethereum address |

**Response**:
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123"
  }
}
```

## DID Document Structure

### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| @context | array | JSON-LD context defining the document structure |
| id | string | The DID being described |
| controller | string/array | DIDs that can make changes to the document |
| verificationMethod | array | Cryptographic keys for verification |
| authentication | array | Methods for authentication |
| assertionMethod | array | Methods for making assertions |
| keyAgreement | array | Methods for key agreement |
| capabilityInvocation | array | Methods for invoking capabilities |
| capabilityDelegation | array | Methods for delegating capabilities |
| service | array | Service endpoints associated with the DID |

### Verification Method Structure

```json
{
  "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
  "type": "EcdsaSecp256k1VerificationKey2019",
  "controller": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
  "publicKeyHex": "0x04..."
}
```

### Service Endpoint Structure

```json
{
  "id": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#profile",
  "type": "ProfileService",
  "serviceEndpoint": "https://profile.example.com/user/0x742d35Cc6634C0532925a3b844Bc9e7595f6E123"
}
```

## Error Handling

### DID-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| DID_ALREADY_EXISTS | 409 | DID already registered for this address |
| DID_NOT_FOUND | 404 | DID does not exist |
| DID_INVALID_FORMAT | 400 | Invalid DID format |
| DID_NOT_AUTHORIZED | 403 | Not authorized to modify this DID |
| DID_DEACTIVATED | 410 | DID has been deactivated |
| BLOCKCHAIN_ERROR | 500 | Blockchain transaction failed |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "DID_NOT_AUTHORIZED",
    "message": "Not authorized to update DID did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "details": {
      "controller": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "requester": "0x123..."
    }
  }
}
```

## Security Considerations

### Authorization

1. **DID Creation**: Any authenticated user can create a DID for their address
2. **DID Updates**: Only the DID controller can update the document
3. **DID Deactivation**: Only the DID controller can deactivate
4. **Private Key Management**: Server uses configured private key for blockchain transactions

### Best Practices

1. **Verify Ownership**: Always verify DID ownership before modifications
2. **Validate Documents**: Ensure DID documents conform to W3C standards
3. **Monitor Gas Costs**: Track blockchain transaction costs
4. **Backup Private Keys**: Securely backup controller private keys

## Usage Examples

### Creating a DID

```javascript
// 1. Authenticate user
const authResponse = await fetch('/api/v1/auth/siwe/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, signature, address })
});
const { accessToken } = await authResponse.json();

// 2. Create DID
const didResponse = await fetch('/api/v1/did', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E123',
    network: 'mainnet'
  })
});

const { data } = await didResponse.json();
console.log('Created DID:', data.did);
```

### Resolving a DID

```javascript
const response = await fetch('/api/v1/did/did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123');
const { data } = await response.json();
console.log('DID Document:', data.didDocument);
```

### Updating a DID Document

```javascript
const response = await fetch('/api/v1/did/did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    document: {
      // Updated document
    }
  })
});
```

## Integration with Other Services

### Authentication Service

DIDs are used as the primary identifier in the authentication system:
- SIWE authentication creates sessions linked to DIDs
- JWT tokens include DID as the subject claim

### Document Verification

DIDs are used to:
- Sign document hashes
- Verify document authenticity
- Track document ownership

### Credential Issuance

DIDs enable:
- Issuing verifiable credentials
- Verifying credential signatures
- Managing credential revocation

## Future Enhancements

1. **Multi-signature Support**: Allow multiple controllers for a DID
2. **Key Rotation**: Automated key rotation for enhanced security
3. **DID Resolution Caching**: Cache resolved DIDs for performance
4. **Cross-chain DIDs**: Support DIDs on multiple blockchains
5. **DID Recovery**: Implement social recovery mechanisms