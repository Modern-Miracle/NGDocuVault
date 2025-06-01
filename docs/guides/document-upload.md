# Document Upload Guide

This guide explains how to upload and register documents using the Docu platform.

## Overview

The document registration process involves:
1. Uploading document data to IPFS
2. Registering the document hash on the blockchain
3. Managing access permissions

## Prerequisites

- Connected wallet with issuer role
- Sufficient ETH for gas fees
- Document file ready for upload

## Step-by-Step Process

### 1. Access Register Document Page

Navigate to `/register-document` or click "Register Document" in the sidebar.

**Note**: Only users with the `ISSUER_ROLE` can access this page.

### 2. Fill Document Details

#### Holder Address
- Enter the Ethereum address of the document holder
- Format: `0x...` (42 characters)
- This is who will own and control access to the document

#### Document Type
Select from available types:
- `GENERAL` - General documents
- `IDENTITY` - Identity-related documents
- `HEALTH` - Health records
- `FINANCIAL` - Financial documents
- `EDUCATIONAL` - Educational certificates
- `LEGAL` - Legal documents
- `CERTIFICATION` - Professional certifications
- `OTHER` - Other document types

#### Expiration Date
- Select when the document should expire
- Must be a future date
- Documents cannot be verified after expiration

#### File Upload
- Click "Choose File" to select document
- Supported formats: Any file type
- Maximum recommended size: 10MB
- File is converted to Base64 for storage

### 3. Submit Registration

1. Click "Register Document"
2. Confirm the transaction in your wallet
3. Wait for IPFS upload (progress shown)
4. Wait for blockchain confirmation

### 4. Success

Upon successful registration:
- Document is stored on IPFS
- Document hash is recorded on blockchain
- CID (Content Identifier) is generated
- Redirected to documents list

## Technical Details

### IPFS Upload Process

1. **File Preparation**
   ```javascript
   // File is converted to Base64
   const fileBase64 = await fileToBase64(file);
   
   // Document data structure
   const documentData = {
     name: file.name,
     description: `Document of type ${documentType}`,
     document: {
       documentType: documentType.toLowerCase(),
       content: fileBase64,
       fileName: file.name,
       contentType: file.type,
       fileSize: file.size
     }
   };
   ```

2. **IPFS Upload**
   - Data is sent to backend API endpoint
   - Backend encrypts data (if ENCRYPTION_KEY is set)
   - Uploads to IPFS via Pinata
   - Returns CID and content hash

3. **Blockchain Registration**
   ```solidity
   registerDocument(
     bytes32 documentId,    // Hash of CID
     string cid,           // IPFS CID
     address holder,       // Document holder
     uint256 issuanceDate, // Current timestamp
     uint256 expirationDate,
     uint8 documentType
   )
   ```

### Backend Configuration

Required environment variables:
```bash
# IPFS Configuration
PINATA_API_JWT=your-pinata-jwt-token
IPFS_GATEWAY_URL=gateway.pinata.cloud

# Encryption (optional but recommended)
ENCRYPTION_KEY=32-character-encryption-key
```

### API Endpoints

**Upload Encrypted Data**
```
POST /api/v1/ipfs/upload/encrypted
Body: {
  document: { ... },
  metadata: {
    name: string,
    owner: string,
    type: string
  }
}
```

**Response**
```json
{
  "success": true,
  "cid": "QmXxx...",
  "size": 1234,
  "contentHash": "0x..."
}
```

## Error Handling

### Common Errors

1. **"You must be registered as an issuer"**
   - User doesn't have ISSUER_ROLE
   - Contact admin to grant role

2. **"Invalid holder address"**
   - Address format is incorrect
   - Must be valid Ethereum address

3. **"Invalid expiration date"**
   - Date is in the past
   - Select future date

4. **"Failed to upload to IPFS"**
   - Check backend logs
   - Verify PINATA_API_JWT is set
   - Check network connectivity

5. **"Failed to register document"**
   - Blockchain transaction failed
   - Check gas fees
   - Verify contract deployment

### Troubleshooting

1. **Check Issuer Status**
   ```javascript
   const { data: isIssuer } = useIsIssuer(address);
   console.log('Is issuer:', isIssuer);
   ```

2. **Verify Backend Configuration**
   ```bash
   # Check if IPFS service is configured
   grep PINATA_API_JWT .env
   grep ENCRYPTION_KEY .env
   ```

3. **Monitor Network Requests**
   - Open browser DevTools
   - Check Network tab for failed requests
   - Look for CORS errors

## Security Considerations

1. **Document Encryption**
   - Documents are encrypted before IPFS upload
   - Encryption key must be kept secure
   - Only encrypted data is stored publicly

2. **Access Control**
   - Only document holder can grant access
   - Issuer maintains record of issuance
   - Blockchain provides audit trail

3. **Data Privacy**
   - Sensitive data should be encrypted
   - Consider document type when uploading
   - IPFS data is publicly accessible if CID is known

## Best Practices

1. **Document Preparation**
   - Compress large files before upload
   - Use descriptive file names
   - Remove unnecessary metadata

2. **Gas Optimization**
   - Batch document registrations when possible
   - Monitor gas prices
   - Use appropriate document types

3. **Error Recovery**
   - Save CID if blockchain transaction fails
   - Can retry registration with same CID
   - Keep local backup of documents

## Integration Example

```typescript
// Using the document registration hook
import { useCreateRecordWithIPFS } from '@/hooks/use-ipfs-mutations';

function DocumentUpload() {
  const { mutateAsync: createRecord } = useCreateRecordWithIPFS();
  
  const handleUpload = async (file: File, holder: string) => {
    // Prepare document data
    const documentData = {
      name: file.name,
      document: {
        documentType: 'general',
        content: await fileToBase64(file),
        fileName: file.name
      }
    };
    
    // Upload and register
    const result = await createRecord({
      data: documentData,
      holder: holder as `0x${string}`
    });
    
    console.log('Document registered:', result.cid);
  };
}
```

## Next Steps

After successful document registration:
1. View document in documents list
2. Share document with verifiers
3. Manage access permissions
4. Track verification status