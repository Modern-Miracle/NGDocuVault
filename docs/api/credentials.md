# Credentials API Documentation

## Overview

The Credentials API enables the issuance, verification, and management of Verifiable Credentials (VCs) following the W3C Verifiable Credentials Data Model. These credentials enable trusted, decentralized attestations about subjects.

**Note**: Credential endpoints are currently disabled in the codebase but documented here for reference and future implementation.

## Verifiable Credential Structure

A Verifiable Credential in the Docu system follows the W3C standard:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "id": "https://docu.io/credentials/3732",
  "type": ["VerifiableCredential", "DocumentVerificationCredential"],
  "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
  "issuanceDate": "2024-01-01T19:23:24Z",
  "credentialSubject": {
    "id": "did:ethr:mainnet:0x123...",
    "documentHash": "0xabcdef...",
    "verified": true
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2024-01-01T19:23:24Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
    "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..."
  }
}
```

## Endpoints

### Issue Credential

Issue a new verifiable credential.

**Endpoint**: `POST /api/v1/credentials`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subject": "did:ethr:mainnet:0x123...",
  "type": "DocumentVerificationCredential",
  "claims": {
    "documentHash": "0xabcdef...",
    "documentType": "medical_record",
    "verified": true,
    "verificationDate": "2024-01-01T00:00:00Z",
    "metadata": {
      "issuerName": "Docu Verification Service",
      "verificationMethod": "manual_review"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://docu.io/contexts/v1"
    ],
    "id": "https://docu.io/credentials/3732",
    "type": ["VerifiableCredential", "DocumentVerificationCredential"],
    "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "issuanceDate": "2024-01-01T19:23:24Z",
    "credentialSubject": {
      "id": "did:ethr:mainnet:0x123...",
      "documentHash": "0xabcdef...",
      "documentType": "medical_record",
      "verified": true,
      "verificationDate": "2024-01-01T00:00:00Z"
    },
    "proof": {
      "type": "EcdsaSecp256k1Signature2019",
      "created": "2024-01-01T19:23:24Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
      "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..."
    }
  }
}
```

### Get Credential

Retrieve a specific credential by ID.

**Endpoint**: `GET /api/v1/credentials/:id`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The credential ID |

**Response**:
```json
{
  "success": true,
  "data": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "https://docu.io/credentials/3732",
    "type": ["VerifiableCredential", "DocumentVerificationCredential"],
    "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "issuanceDate": "2024-01-01T19:23:24Z",
    "credentialSubject": {
      "id": "did:ethr:mainnet:0x123...",
      "documentHash": "0xabcdef...",
      "verified": true
    },
    "proof": {
      // Proof details
    }
  }
}
```

### Verify Credential

Verify the authenticity and validity of a credential.

**Endpoint**: `POST /api/v1/credentials/verify`

**Request Body**:
```json
{
  "credentialId": "https://docu.io/credentials/3732"
}
```

Or with full credential:

```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "https://docu.io/credentials/3732",
    "type": ["VerifiableCredential", "DocumentVerificationCredential"],
    "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "issuanceDate": "2024-01-01T19:23:24Z",
    "credentialSubject": {
      "id": "did:ethr:mainnet:0x123...",
      "documentHash": "0xabcdef...",
      "verified": true
    },
    "proof": {
      // Proof details
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "credential": {
      // Full credential object
    },
    "verificationResult": {
      "checks": [
        {
          "check": "signature",
          "status": "passed",
          "message": "Signature is valid"
        },
        {
          "check": "issuer",
          "status": "passed",
          "message": "Issuer DID is active and valid"
        },
        {
          "check": "expiration",
          "status": "passed",
          "message": "Credential has not expired"
        },
        {
          "check": "revocation",
          "status": "passed",
          "message": "Credential has not been revoked"
        }
      ],
      "warnings": [],
      "errors": []
    }
  }
}
```

### List Credentials

Get a list of credentials with optional filtering.

**Endpoint**: `GET /api/v1/credentials`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| issuer | string | No | Filter by issuer DID |
| subject | string | No | Filter by subject DID |
| type | string | No | Filter by credential type |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "https://docu.io/credentials/3732",
      "type": ["VerifiableCredential", "DocumentVerificationCredential"],
      "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "issuanceDate": "2024-01-01T19:23:24Z",
      "credentialSubject": {
        "id": "did:ethr:mainnet:0x123...",
        "documentHash": "0xabcdef..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Revoke Credential

Revoke a previously issued credential.

**Endpoint**: `DELETE /api/v1/credentials/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The credential ID to revoke |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "https://docu.io/credentials/3732",
    "status": "revoked",
    "revokedAt": "2024-01-02T00:00:00Z",
    "revocationReason": "Credential issued in error"
  }
}
```

## Credential Types

### Document Verification Credential

Used to attest that a document has been verified.

```json
{
  "type": ["VerifiableCredential", "DocumentVerificationCredential"],
  "credentialSubject": {
    "id": "did:ethr:mainnet:0x123...",
    "documentHash": "0xabcdef...",
    "documentType": "medical_record",
    "verified": true,
    "verificationDate": "2024-01-01T00:00:00Z",
    "verificationMethod": "manual_review"
  }
}
```

### Identity Verification Credential

Used to attest identity verification status.

```json
{
  "type": ["VerifiableCredential", "IdentityVerificationCredential"],
  "credentialSubject": {
    "id": "did:ethr:mainnet:0x123...",
    "verificationLevel": "KYC_FULL",
    "verifiedAttributes": {
      "name": true,
      "dateOfBirth": true,
      "address": true,
      "nationalId": true
    },
    "verificationDate": "2024-01-01T00:00:00Z"
  }
}
```

### Role Assignment Credential

Used to assign roles within the Docu system.

```json
{
  "type": ["VerifiableCredential", "RoleAssignmentCredential"],
  "credentialSubject": {
    "id": "did:ethr:mainnet:0x123...",
    "role": "issuer",
    "permissions": [
      "issue_document_verification",
      "issue_identity_verification"
    ],
    "validFrom": "2024-01-01T00:00:00Z",
    "validUntil": "2025-01-01T00:00:00Z"
  }
}
```

## Credential Proofs

### Supported Proof Types

1. **EcdsaSecp256k1Signature2019**
   - Used for Ethereum-based signatures
   - Compatible with DID:ethr method

2. **Ed25519Signature2018**
   - Alternative signature scheme
   - Higher performance

### Proof Structure

```json
{
  "type": "EcdsaSecp256k1Signature2019",
  "created": "2024-01-01T19:23:24Z",
  "proofPurpose": "assertionMethod",
  "verificationMethod": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123#key-1",
  "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..."
}
```

## Verification Process

### Verification Steps

1. **Signature Verification**
   - Verify the cryptographic signature
   - Ensure signature matches issuer's public key

2. **Issuer Validation**
   - Resolve issuer DID
   - Verify issuer is authorized to issue this credential type

3. **Temporal Validation**
   - Check issuance date is valid
   - Verify credential hasn't expired

4. **Revocation Check**
   - Query revocation registry
   - Ensure credential hasn't been revoked

5. **Schema Validation**
   - Validate credential against JSON-LD schema
   - Ensure all required fields are present

### Verification Response Details

```json
{
  "isValid": true,
  "verificationResult": {
    "checks": [
      {
        "check": "signature",
        "status": "passed",
        "details": {
          "algorithm": "ES256K",
          "publicKey": "0x04..."
        }
      },
      {
        "check": "issuer",
        "status": "passed",
        "details": {
          "did": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
          "isActive": true,
          "isAuthorized": true
        }
      },
      {
        "check": "temporal",
        "status": "passed",
        "details": {
          "issuedAt": "2024-01-01T19:23:24Z",
          "expiresAt": null,
          "currentTime": "2024-01-02T10:00:00Z"
        }
      }
    ]
  }
}
```

## Error Handling

### Credential-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| CREDENTIAL_NOT_FOUND | 404 | Credential ID does not exist |
| CREDENTIAL_INVALID_ISSUER | 403 | Issuer not authorized to issue this credential type |
| CREDENTIAL_MALFORMED | 400 | Credential structure is invalid |
| CREDENTIAL_EXPIRED | 410 | Credential has expired |
| CREDENTIAL_REVOKED | 410 | Credential has been revoked |
| CREDENTIAL_INVALID_SIGNATURE | 400 | Signature verification failed |
| CREDENTIAL_INVALID_SUBJECT | 400 | Subject DID is invalid or inactive |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "CREDENTIAL_INVALID_SIGNATURE",
    "message": "Credential signature verification failed",
    "details": {
      "credentialId": "https://docu.io/credentials/3732",
      "issuer": "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "reason": "Public key mismatch"
    }
  }
}
```

## Security Considerations

### Authorization Rules

1. **Issuance Authorization**
   - Only users with `issuer` role can issue credentials
   - Specific credential types may require additional permissions

2. **Revocation Authorization**
   - Only the original issuer can revoke a credential
   - System administrators can revoke in exceptional cases

3. **Access Control**
   - Public credentials can be viewed by anyone
   - Private credentials require authorization from subject

### Best Practices

1. **Credential Storage**
   - Store credentials encrypted at rest
   - Use secure key management for signing keys

2. **Validation**
   - Always verify credentials before accepting them
   - Check revocation status in real-time

3. **Privacy**
   - Implement selective disclosure where possible
   - Minimize personally identifiable information

4. **Audit Trail**
   - Log all credential operations
   - Maintain immutable audit records

## Usage Examples

### Issuing a Document Verification Credential

```javascript
const response = await fetch('/api/v1/credentials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    subject: 'did:ethr:mainnet:0x123...',
    type: 'DocumentVerificationCredential',
    claims: {
      documentHash: '0xabcdef...',
      documentType: 'medical_record',
      verified: true,
      verificationDate: new Date().toISOString()
    }
  })
});

const { data: credential } = await response.json();
console.log('Issued credential:', credential.id);
```

### Verifying a Credential

```javascript
const response = await fetch('/api/v1/credentials/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    credentialId: 'https://docu.io/credentials/3732'
  })
});

const { data } = await response.json();
if (data.isValid) {
  console.log('Credential is valid');
} else {
  console.log('Verification failed:', data.verificationResult.errors);
}
```

### Querying Credentials

```javascript
// Get all credentials issued by a specific DID
const response = await fetch('/api/v1/credentials?issuer=did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123');
const { data: credentials } = await response.json();

// Get all credentials for a subject
const subjectCreds = await fetch('/api/v1/credentials?subject=did:ethr:mainnet:0x123...');
```

## Integration with Blockchain

### On-Chain Registration

While credentials are stored off-chain, their hashes can be registered on-chain for:
- Immutable timestamp proof
- Revocation registry
- Audit trail

### Smart Contract Integration

```solidity
contract CredentialRegistry {
    mapping(bytes32 => CredentialRecord) public credentials;
    
    struct CredentialRecord {
        address issuer;
        bytes32 credentialHash;
        uint256 issuedAt;
        bool revoked;
    }
}
```

## Standards Compliance

The Credentials API complies with:

1. **W3C Verifiable Credentials Data Model 1.1**
   - Full compliance with core data model
   - Support for JSON-LD contexts

2. **DID Core Specification**
   - Integration with DID methods
   - Support for DID resolution

3. **JWT/JWS Standards**
   - RFC 7519 (JWT)
   - RFC 7515 (JWS)

## Future Enhancements

1. **Zero-Knowledge Proofs**
   - Selective disclosure of credential attributes
   - Privacy-preserving verification

2. **Credential Presentations**
   - Support for Verifiable Presentations
   - Multi-credential proofs

3. **Advanced Schemas**
   - Custom credential types
   - Schema registry integration

4. **Delegation**
   - Delegated issuance capabilities
   - Proxy verification

5. **Interoperability**
   - Cross-chain credential verification
   - External credential import/export