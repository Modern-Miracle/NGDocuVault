# IPFS Service Documentation

The IPFS service provides decentralized storage for documents using Pinata as the pinning service.

## Overview

The IPFS service handles:
- Document upload and encryption
- Content retrieval and decryption
- Batch operations
- Content persistence via Pinata

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  API Server │────▶│   Pinata    │
│   (React)   │     │  (Express)  │     │   (IPFS)    │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ Encryption  │
                    │   Service   │
                    └─────────────┘
```

## Configuration

### Environment Variables

```bash
# Required
PINATA_API_JWT=your-pinata-jwt-token

# Optional
IPFS_GATEWAY_URL=gateway.pinata.cloud
ENCRYPTION_KEY=32-character-encryption-key
```

### Service Initialization

The IPFS service is initialized as a singleton:

```typescript
// src/services/ipfs/IPFSService.ts
export const ipfsService = new IPFSService();
```

## API Endpoints

### Upload Encrypted Data

Uploads data to IPFS with optional encryption.

**Endpoint**: `POST /api/v1/ipfs/upload/encrypted`

**Request Body**:
```json
{
  "document": {
    "documentType": "general",
    "content": "base64-encoded-content",
    "fileName": "document.pdf",
    "contentType": "application/pdf",
    "fileSize": 12345
  },
  "metadata": {
    "name": "My Document",
    "owner": "0x...",
    "type": "general",
    "description": "Document description"
  }
}
```

**Response**:
```json
{
  "success": true,
  "cid": "QmXxxx...",
  "size": 12345,
  "contentHash": "0x..."
}
```

### Get Data by CID

Retrieves and decrypts data from IPFS.

**Endpoint**: `GET /api/v1/ipfs/data/:cid`

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "metadata": { ... }
}
```

### Batch Upload

Upload multiple documents in a single request.

**Endpoint**: `POST /api/v1/ipfs/batch/upload`

**Request Body**:
```json
{
  "files": [
    {
      "document": { ... },
      "metadata": { ... }
    }
  ]
}
```

### Delete Data

Unpin data from IPFS.

**Endpoint**: `DELETE /api/v1/ipfs/data?cid=QmXxx...`

## Service Implementation

### IPFSService Class

```typescript
export class IPFSService {
  private readonly pinata: PinataSDK;
  private readonly encryptionKey: string;
  
  constructor() {
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_API_JWT,
      pinataGateway: process.env.IPFS_GATEWAY_URL
    });
    
    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
  }
}
```

### Key Methods

#### uploadToIPFS

Uploads JSON data to IPFS:

```typescript
async uploadToIPFS(data: any): Promise<any> {
  const fileName = this.extractFileName(data);
  const result = await this.pinata.upload
    .public
    .json(data)
    .name(fileName);
  return result;
}
```

#### encryptAndUpload

Encrypts data before uploading:

```typescript
async encryptAndUpload(data: BlockchainUpdateRequest): Promise<any> {
  if (this.encryptionKey) {
    const encrypted = encrypt(
      JSON.stringify(data),
      toCipherKey(this.encryptionKey)
    );
    // Upload encrypted data
  } else {
    // Upload unencrypted with warning
  }
}
```

#### fetchFromIPFS

Retrieves data with multiple fallback methods:

```typescript
async fetchFromIPFS(cid: string): Promise<any> {
  // Try private gateway
  // Try public gateway
  // Try file info endpoint
  // Return error if all fail
}
```

## Encryption

### Encryption Flow

1. Check if `ENCRYPTION_KEY` is set
2. If set, encrypt document data
3. Upload encrypted data with metadata
4. Store encryption flag in metadata

### Decryption Flow

1. Fetch encrypted data from IPFS
2. Check if data has `encrypted` property
3. Decrypt using stored key
4. Return decrypted data

## Error Handling

### Common Errors

1. **Missing Pinata JWT**
   ```
   Error: PINATA_API_JWT environment variable is not set
   ```

2. **Invalid CID**
   ```
   Error: Invalid CID format: <cid>
   ```

3. **Upload Failed**
   ```
   Error: IPFS upload failed: <reason>
   ```

4. **Decryption Failed**
   ```
   Error: Failed to decrypt data for CID <cid>
   ```

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Security Considerations

### Data Encryption

- Uses AES-256-GCM encryption
- Encryption key must be 32 characters
- Key should be stored securely
- Never commit encryption key to version control

### Access Control

- No built-in access control in IPFS
- CID knowledge = data access
- Implement application-level permissions
- Use encryption for sensitive data

### Best Practices

1. **Always encrypt sensitive data**
2. **Validate input data**
3. **Handle large files appropriately**
4. **Monitor Pinata usage limits**
5. **Implement retry logic**

## Performance Optimization

### Caching

- Implement client-side caching
- Cache frequently accessed CIDs
- Use CDN for public content

### Batch Operations

- Use batch upload for multiple files
- Reduces API calls
- Better error handling

### Gateway Selection

```typescript
// Try gateways in order of preference
1. Private gateway (authenticated)
2. Public gateway (open access)
3. Direct Pinata API
```

## Monitoring

### Logging

All operations are logged:

```typescript
logger.info(`Data uploaded to IPFS with CID: ${cid}`);
logger.error(`Error retrieving IPFS data:`, error);
```

### Metrics to Track

1. Upload success rate
2. Average upload time
3. Retrieval success rate
4. Gateway performance
5. Storage usage

## Testing

### Unit Tests

```typescript
describe('IPFSService', () => {
  it('should upload data to IPFS', async () => {
    const result = await ipfsService.uploadToIPFS(data);
    expect(result.cid).toBeDefined();
  });
  
  it('should encrypt data when key is set', async () => {
    const result = await ipfsService.encryptAndUpload(data);
    expect(result.metadata.encrypted).toBe(true);
  });
});
```

### Integration Tests

Test with actual Pinata API:

```bash
# Run integration tests
npm run test:integration
```

## Troubleshooting

### Debug Mode

Enable debug logging:

```typescript
if (process.env.DEBUG) {
  console.log('IPFS Request:', data);
  console.log('IPFS Response:', result);
}
```

### Common Issues

1. **CORS Errors**
   - Configure CORS in API
   - Use proxy in development

2. **Rate Limiting**
   - Implement request throttling
   - Use batch operations

3. **Large Files**
   - Implement chunking
   - Show upload progress

## Migration Guide

### From Local IPFS to Pinata

1. Update environment variables
2. Replace IPFS client with Pinata SDK
3. Update upload/retrieval methods
4. Test with existing CIDs

### Backup Strategy

1. Keep local copies of critical documents
2. Store CID mappings in database
3. Implement periodic pinning verification