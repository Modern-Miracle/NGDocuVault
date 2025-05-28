# IPFS API Documentation

## Overview

The IPFS API provides decentralized storage capabilities for the Docu platform using Pinata as the pinning service. It handles document upload, retrieval, encryption, and batch operations for efficient management of distributed content.

## Base URL

```
/api/v1/ipfs
```

## Endpoints

### Get Data by CID

Retrieve data from IPFS using a Content Identifier (CID).

**Endpoint**: `GET /api/v1/ipfs/data/:cid`

**Alternative**: `GET /api/v1/ipfs/data?cid=<cid>`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cid | string | Yes | IPFS Content Identifier |

**Response**:
```json
{
  "success": true,
  "data": {
    "document": {
      "documentType": "general",
      "content": "base64-encoded-content",
      "fileName": "document.pdf",
      "contentType": "application/pdf",
      "fileSize": 12345
    },
    "metadata": {
      "name": "My Document",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
      "type": "general",
      "description": "Document description",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Example Request**:
```bash
curl -X GET "http://localhost:3001/api/v1/ipfs/data/QmXxxx..."
```

### Get Bulk Data

Retrieve multiple documents from IPFS in a single request.

**Endpoint**: `POST /api/v1/ipfs/data/bulk`

**Request Body**:
```json
{
  "cids": [
    "QmXxxx...",
    "QmYyyy...",
    "QmZzzz..."
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "cid": "QmXxxx...",
      "success": true,
      "data": {
        // Document data
      }
    },
    {
      "cid": "QmYyyy...",
      "success": false,
      "error": "CID not found"
    },
    {
      "cid": "QmZzzz...",
      "success": true,
      "data": {
        // Document data
      }
    }
  ]
}
```

### Re-encrypt Data

Re-encrypt existing IPFS data with a specific public key for secure sharing.

**Endpoint**: `GET /api/v1/ipfs/reencrypt/:cid?publicKey=<publicKey>`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cid | string | Yes | IPFS Content Identifier |
| publicKey | string | Yes | Public key for re-encryption |

**Response**:
```json
{
  "success": true,
  "data": {
    "originalCid": "QmXxxx...",
    "encryptedData": "encrypted-base64-content",
    "encryptionMethod": "RSA-OAEP",
    "publicKey": "0x04..."
  }
}
```

### Upload JSON Data

Upload JSON data directly to IPFS.

**Endpoint**: `POST /api/v1/ipfs/upload/json`

**Request Body**:
```json
{
  "data": {
    "title": "Document Title",
    "content": "Document content",
    "metadata": {
      "author": "John Doe",
      "created": "2024-01-01T00:00:00Z"
    }
  },
  "fileName": "document.json"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cid": "QmXxxx...",
    "size": 1234,
    "timestamp": "2024-01-01T00:00:00Z",
    "gateway": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
  }
}
```

### Upload Encrypted Data

Upload data to IPFS with encryption.

**Endpoint**: `POST /api/v1/ipfs/upload/encrypted`

**Request Body**:
```json
{
  "document": {
    "documentType": "medical",
    "content": "base64-encoded-content",
    "fileName": "medical-record.pdf",
    "contentType": "application/pdf",
    "fileSize": 12345
  },
  "metadata": {
    "name": "Medical Record",
    "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "type": "medical",
    "description": "Patient medical record",
    "tags": ["medical", "confidential"],
    "permissions": {
      "read": ["0x123...", "0x456..."],
      "write": ["0x742d35Cc6634C0532925a3b844Bc9e7595f6E123"]
    }
  },
  "encryptionOptions": {
    "algorithm": "AES-256-GCM",
    "keyDerivation": "PBKDF2"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cid": "QmXxxx...",
    "size": 12890,
    "contentHash": "0xabcdef...",
    "encrypted": true,
    "encryptionMetadata": {
      "algorithm": "AES-256-GCM",
      "keyId": "key-123",
      "iv": "base64-iv"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Batch Upload

Upload multiple files to IPFS in a single request.

**Endpoint**: `POST /api/v1/ipfs/batch/upload`

**Request Body**:
```json
{
  "files": [
    {
      "document": {
        "documentType": "contract",
        "content": "base64-content-1",
        "fileName": "contract.pdf",
        "contentType": "application/pdf",
        "fileSize": 10000
      },
      "metadata": {
        "name": "Service Contract",
        "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
        "type": "contract"
      }
    },
    {
      "document": {
        "documentType": "invoice",
        "content": "base64-content-2",
        "fileName": "invoice.pdf",
        "contentType": "application/pdf",
        "fileSize": 5000
      },
      "metadata": {
        "name": "Invoice #123",
        "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
        "type": "invoice"
      }
    }
  ],
  "options": {
    "encrypt": true,
    "createManifest": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "fileName": "contract.pdf",
        "cid": "QmXxxx...",
        "size": 10240,
        "success": true
      },
      {
        "fileName": "invoice.pdf",
        "cid": "QmYyyy...",
        "size": 5120,
        "success": true
      }
    ],
    "manifest": {
      "cid": "QmZzzz...",
      "files": 2,
      "totalSize": 15360
    },
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

### Delete Data

Unpin data from IPFS (remove from Pinata).

**Endpoint**: `DELETE /api/v1/ipfs/data?cid=<cid>`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cid | string | Yes | IPFS Content Identifier to unpin |

**Response**:
```json
{
  "success": true,
  "data": {
    "cid": "QmXxxx...",
    "unpinned": true,
    "message": "Content unpinned successfully"
  }
}
```

### Batch Delete

Delete multiple files from IPFS in a single request.

**Endpoint**: `DELETE /api/v1/ipfs/batch`

**Request Body**:
```json
{
  "cids": [
    "QmXxxx...",
    "QmYyyy...",
    "QmZzzz..."
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "cid": "QmXxxx...",
        "success": true,
        "unpinned": true
      },
      {
        "cid": "QmYyyy...",
        "success": false,
        "error": "CID not found"
      },
      {
        "cid": "QmZzzz...",
        "success": true,
        "unpinned": true
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

## Data Structures

### Document Structure

```typescript
interface Document {
  documentType: 'general' | 'medical' | 'legal' | 'financial' | 'contract' | 'invoice';
  content: string; // Base64 encoded content
  fileName: string;
  contentType: string; // MIME type
  fileSize: number; // Size in bytes
}
```

### Metadata Structure

```typescript
interface Metadata {
  name: string;
  owner: string; // Ethereum address
  type: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  permissions?: {
    read: string[]; // Array of addresses
    write: string[]; // Array of addresses
  };
  customFields?: Record<string, any>;
}
```

### Encryption Options

```typescript
interface EncryptionOptions {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keyDerivation?: 'PBKDF2' | 'scrypt' | 'argon2';
  iterations?: number;
  saltLength?: number;
}
```

## Error Handling

### IPFS-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| IPFS_CID_NOT_FOUND | 404 | CID does not exist in IPFS |
| IPFS_INVALID_CID | 400 | Invalid CID format |
| IPFS_UPLOAD_FAILED | 500 | Failed to upload to IPFS |
| IPFS_GATEWAY_ERROR | 502 | IPFS gateway unreachable |
| IPFS_DECRYPTION_FAILED | 400 | Failed to decrypt content |
| IPFS_SIZE_LIMIT_EXCEEDED | 413 | File size exceeds limit |
| IPFS_PINNING_FAILED | 500 | Failed to pin content |
| IPFS_RATE_LIMITED | 429 | Too many requests to IPFS |

### Error Response Format

```json
{
  "success": false,
  "error": "IPFS_CID_NOT_FOUND",
  "message": "Content with CID QmXxxx... not found in IPFS",
  "details": {
    "cid": "QmXxxx...",
    "gateway": "gateway.pinata.cloud"
  }
}
```

## Security Considerations

### Encryption

1. **At-Rest Encryption**
   - All sensitive documents are encrypted before uploading
   - AES-256-GCM is the default encryption algorithm
   - Encryption keys are derived from user credentials

2. **Key Management**
   - Keys are never stored with the content
   - Support for key rotation
   - Hardware security module (HSM) integration available

3. **Access Control**
   - Content access is controlled at the application level
   - CID knowledge doesn't guarantee decryption ability
   - Permission checks before serving content

### Best Practices

1. **Content Validation**
   - Validate file types and sizes before upload
   - Scan for malware when applicable
   - Verify content integrity after retrieval

2. **Rate Limiting**
   - Upload endpoints: 10 requests per minute
   - Download endpoints: 100 requests per minute
   - Bulk operations: 5 requests per minute

3. **Monitoring**
   - Track upload/download metrics
   - Monitor Pinata API usage
   - Alert on suspicious activities

## Performance Optimization

### Caching Strategy

1. **Gateway Caching**
   - Use CDN for frequently accessed content
   - Cache decrypted content in memory (with TTL)
   - Implement browser caching headers

2. **Batch Operations**
   - Use bulk endpoints for multiple files
   - Parallel processing for better throughput
   - Progress tracking for large uploads

### Size Limits

| Operation | Limit | Notes |
|-----------|-------|-------|
| Single file upload | 100 MB | Configurable per deployment |
| Batch upload total | 500 MB | Sum of all files |
| JSON upload | 10 MB | For structured data |
| Concurrent uploads | 5 | Per user session |

## Usage Examples

### Upload and Retrieve Document

```javascript
// Upload document
const uploadResponse = await fetch('/api/v1/ipfs/upload/encrypted', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    document: {
      documentType: 'medical',
      content: btoa(fileContent), // Base64 encode
      fileName: 'medical-record.pdf',
      contentType: 'application/pdf',
      fileSize: fileContent.length
    },
    metadata: {
      name: 'Medical Record 2024',
      owner: userAddress,
      type: 'medical',
      description: 'Annual health checkup'
    }
  })
});

const { data } = await uploadResponse.json();
const cid = data.cid;

// Retrieve document
const getResponse = await fetch(`/api/v1/ipfs/data/${cid}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const retrievedData = await getResponse.json();
console.log('Document retrieved:', retrievedData.data);
```

### Batch Upload with Progress

```javascript
async function uploadBatch(files) {
  const formattedFiles = files.map(file => ({
    document: {
      documentType: 'general',
      content: file.content,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size
    },
    metadata: {
      name: file.name,
      owner: userAddress,
      type: 'general'
    }
  }));

  const response = await fetch('/api/v1/ipfs/batch/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      files: formattedFiles,
      options: {
        encrypt: true,
        createManifest: true
      }
    })
  });

  const result = await response.json();
  
  console.log(`Uploaded ${result.data.summary.successful} of ${result.data.summary.total} files`);
  
  return result.data.results;
}
```

### Re-encrypt for Sharing

```javascript
// Re-encrypt document for sharing with another user
const recipientPublicKey = '0x04...'; // Recipient's public key

const response = await fetch(`/api/v1/ipfs/reencrypt/${cid}?publicKey=${recipientPublicKey}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data } = await response.json();
// Share the encrypted data with the recipient
```

## Integration with Smart Contracts

### Document Registration

After uploading to IPFS, register the document on-chain:

```javascript
// Upload to IPFS first
const ipfsResponse = await uploadToIPFS(document);
const cid = ipfsResponse.data.cid;
const contentHash = ipfsResponse.data.contentHash;

// Register on blockchain
const tx = await docuVault.registerDocument(
  cid,
  contentHash,
  documentType
);
```

### Verification Flow

1. Retrieve CID from blockchain
2. Fetch document from IPFS
3. Verify hash matches on-chain record
4. Decrypt if authorized

## Monitoring and Analytics

### Metrics Tracked

1. **Upload Metrics**
   - Total uploads per day
   - Average file size
   - Upload success rate
   - Encryption usage

2. **Retrieval Metrics**
   - Total downloads per day
   - Cache hit rate
   - Average response time
   - Gateway performance

3. **Storage Metrics**
   - Total storage used
   - Number of pinned files
   - Storage cost tracking

### Health Checks

```bash
# Check IPFS service health
GET /api/v1/ipfs/health

Response:
{
  "status": "healthy",
  "pinata": {
    "connected": true,
    "remainingPins": 9500,
    "usedStorage": "45.2 GB"
  },
  "performance": {
    "avgUploadTime": "1.2s",
    "avgDownloadTime": "0.8s"
  }
}
```

## Future Enhancements

1. **IPFS Cluster Support**
   - Distributed pinning across multiple nodes
   - Improved redundancy and availability

2. **Advanced Encryption**
   - Threshold encryption schemes
   - Homomorphic encryption for computations

3. **Content Delivery**
   - P2P content delivery
   - Offline-first capabilities

4. **Integration Features**
   - Direct integration with cloud storage
   - Automated backup strategies