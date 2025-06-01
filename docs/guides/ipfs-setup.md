# IPFS Setup Guide

This guide covers setting up IPFS integration for the Docu platform using Pinata.

## Overview

The Docu platform uses IPFS (InterPlanetary File System) for decentralized document storage with Pinata as the pinning service to ensure persistence.

## Prerequisites

- Pinata account (free tier available)
- Node.js environment
- Access to environment variables

## Setup Steps

### 1. Create Pinata Account

1. Go to [https://pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email

### 2. Generate API Keys

1. Navigate to API Keys section
2. Click "New Key"
3. Give it a name (e.g., "Docu Development")
4. Select permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
   - `pinList`
5. Create and copy the JWT token

### 3. Configure Backend

#### Environment Variables

Add to `/apps/api/.env`:

```bash
# IPFS Configuration
PINATA_API_JWT=your-jwt-token-here
IPFS_GATEWAY_URL=gateway.pinata.cloud

# Encryption Configuration (recommended)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Example encryption key (DO NOT USE IN PRODUCTION)
# ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### Generate Encryption Key

```bash
# Generate a secure 32-character key
openssl rand -hex 16

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Verify Configuration

#### Test Upload

```bash
# Start the API server
cd apps/api
pnpm dev

# Test IPFS endpoint
curl -X POST http://localhost:5000/api/v1/ipfs/upload/json \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Expected response:
```json
{
  "success": true,
  "cid": "QmXxx...",
  "size": 123
}
```

### 5. Frontend Configuration

No additional configuration needed for frontend. It uses the API proxy.

## Configuration Options

### Pinata Settings

```typescript
// apps/api/src/services/ipfs/IPFSService.ts
this.pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_API_JWT,
  pinataGateway: process.env.IPFS_GATEWAY_URL || 'gateway.pinata.cloud'
});
```

### Encryption Settings

```typescript
// Encryption is optional but recommended
if (this.encryptionKey && this.encryptionKey.length > 0) {
  // Encrypt data before upload
} else {
  // Upload unencrypted with warning
}
```

## Testing IPFS Integration

### 1. Unit Tests

```bash
cd apps/api
pnpm test ipfs.service.test.ts
```

### 2. Integration Test

Create a test file:

```typescript
// test-ipfs.ts
import { IPFSService } from './src/services/ipfs/IPFSService';

async function testIPFS() {
  const service = new IPFSService();
  
  // Test upload
  const result = await service.uploadToIPFS({
    test: 'Hello IPFS'
  });
  
  console.log('Upload result:', result);
  
  // Test fetch
  const data = await service.fetchFromIPFS(result.cid);
  console.log('Fetched data:', data);
}

testIPFS().catch(console.error);
```

### 3. End-to-End Test

1. Start backend: `pnpm dev:api`
2. Start frontend: `pnpm dev:web`
3. Login as issuer
4. Navigate to Register Document
5. Upload a test file
6. Verify in Pinata dashboard

## Troubleshooting

### Common Issues

#### 1. "PINATA_API_JWT environment variable is not set"

**Solution**: Ensure `.env` file exists and contains `PINATA_API_JWT`

```bash
# Check if variable is set
grep PINATA_API_JWT .env
```

#### 2. "Failed to upload to IPFS"

**Possible causes**:
- Invalid JWT token
- Network connectivity issues
- Pinata API rate limits

**Debug steps**:
```bash
# Test Pinata connection
curl https://api.pinata.cloud/data/testAuthentication \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. "Encryption key not set"

**Solution**: Generate and set `ENCRYPTION_KEY` in `.env`

Warning appears as:
```
ENCRYPTION_KEY not set, uploading unencrypted data
```

#### 4. CORS Errors

**Solution**: Ensure CORS is properly configured in `apps/api/src/config/cors.config.ts`

```typescript
export const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
```

### Debug Mode

Enable debug logging:

```bash
# In .env
DEBUG=ipfs:*

# Or when starting server
DEBUG=ipfs:* pnpm dev:api
```

## Performance Optimization

### 1. File Size Limits

Configure in frontend:

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large. Maximum size is 10MB');
}
```

### 2. Compression

For large documents:

```typescript
// Before upload
const compressed = await compressFile(file);
const base64 = await fileToBase64(compressed);
```

### 3. Caching

Implement CID caching:

```typescript
// Cache successful uploads
localStorage.setItem(`ipfs-${cid}`, JSON.stringify({
  cid,
  timestamp: Date.now(),
  metadata
}));
```

## Security Best Practices

### 1. Encryption Key Management

- Never commit encryption keys
- Use environment variables
- Rotate keys periodically
- Use different keys per environment

### 2. Access Control

- Implement rate limiting
- Validate file types
- Scan for malware
- Limit file sizes

### 3. Data Privacy

- Encrypt sensitive documents
- Don't store personal data in metadata
- Use private gateways when possible
- Implement access logging

## Monitoring

### 1. Pinata Dashboard

Monitor usage at: https://app.pinata.cloud/pinmanager

- Total storage used
- Number of pins
- API usage
- Gateway bandwidth

### 2. Application Metrics

Track in your app:

```typescript
// Log successful uploads
logger.info('IPFS upload', {
  cid: result.cid,
  size: result.size,
  duration: Date.now() - startTime
});

// Monitor errors
logger.error('IPFS upload failed', {
  error: error.message,
  file: fileName
});
```

### 3. Alerts

Set up alerts for:
- Upload failures > 5%
- Response time > 10s
- Storage quota warnings
- API rate limit warnings

## Backup Strategy

### 1. Regular Pinning Verification

```typescript
// Verify important CIDs are still pinned
async function verifyPins(cids: string[]) {
  for (const cid of cids) {
    const isPinned = await pinata.pinList({
      hashContains: cid
    });
    
    if (!isPinned.count) {
      // Re-pin if needed
      await repinContent(cid);
    }
  }
}
```

### 2. Database Backup

Store CID mappings:

```sql
CREATE TABLE ipfs_documents (
  id UUID PRIMARY KEY,
  cid VARCHAR(255) NOT NULL,
  document_type VARCHAR(50),
  owner_address VARCHAR(42),
  created_at TIMESTAMP,
  metadata JSONB
);
```

### 3. Multi-Provider Strategy

Consider pinning to multiple services:
- Pinata (primary)
- Infura IPFS (backup)
- Local IPFS node (archive)

## Migration from Local IPFS

If migrating from local IPFS node:

1. Export existing pins
2. Upload to Pinata
3. Update CID references
4. Verify accessibility

```bash
# Export from local IPFS
ipfs pin ls --type recursive > pins.txt

# Upload to Pinata (script needed)
node migrate-to-pinata.js pins.txt
```

## Cost Optimization

### Free Tier Limits

Pinata free tier includes:
- 1GB storage
- 1000 pins
- Unlimited gateway requests

### Optimization Tips

1. Remove duplicate files
2. Unpin old/expired documents
3. Compress before upload
4. Use efficient data structures

### Cleanup Script

```typescript
// Remove expired documents
async function cleanupExpiredDocs() {
  const expiredDocs = await getExpiredDocuments();
  
  for (const doc of expiredDocs) {
    await ipfsService.unpinFromIPFS(doc.cid);
    await markDocumentUnpinned(doc.id);
  }
}
```