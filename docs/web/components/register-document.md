# Register Document Component

The Register Document feature allows authorized issuers to upload and register documents on the blockchain.

## Overview

Location: `/apps/web/src/pages/RegisterDocument.tsx`

The Register Document page provides:
- Document upload interface
- Holder assignment
- Document type selection
- Expiration date setting
- IPFS upload with progress tracking
- Blockchain registration

## Components Structure

```
RegisterDocument (Page)
├── RegisterDocumentForm
│   ├── DocumentFormFields
│   ├── FileUploadSection
│   ├── UploadProgress
│   └── FormActions
```

## Access Control

Only users with `ISSUER_ROLE` can access this feature:

```typescript
const { address } = useAuth();
const { data: isIssuer, isLoading } = useIsIssuer(address);

if (!isIssuer) {
  return <AccessDenied />;
}
```

## Form Components

### DocumentFormFields

Handles document metadata input:

```typescript
interface FormData {
  holder: string;           // Ethereum address
  documentType: DocumentType; // Enum value
  expirationDate: string;   // ISO date string
  file: File | null;
}
```

**Fields**:
- **Holder Address**: The document owner's Ethereum address
- **Document Type**: Dropdown with predefined types
- **Expiration Date**: Date picker for document validity

### FileUploadSection

Manages file selection and display:

```typescript
<FileUploadSection
  file={formData.file}
  handleFileChange={handleFileChange}
  removeFile={removeFile}
  uploadError={uploadError}
/>
```

**Features**:
- Drag-and-drop support
- File preview
- File size display
- Remove file option
- Error display

### UploadProgress

Shows upload progress during IPFS upload:

```typescript
<UploadProgress progress={uploadProgress} />
```

Progress stages:
1. 10% - Starting upload
2. 40% - File converted to Base64
3. 50% - Uploading to IPFS
4. 100% - Registration complete

## Data Flow

### 1. File Processing

```typescript
// Convert file to Base64
const fileReader = new FileReader();
const fileBase64 = await new Promise<string>((resolve, reject) => {
  fileReader.onload = () => resolve(fileReader.result as string);
  fileReader.onerror = reject;
  fileReader.readAsDataURL(file);
});
```

### 2. Document Structure

```typescript
const documentData = {
  name: file.name,
  description: `Document of type ${DocumentType[formData.documentType]}`,
  document: {
    documentType: DocumentType[formData.documentType].toLowerCase(),
    content: fileBase64,
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  },
};
```

### 3. IPFS Upload

Uses the `useCreateRecordWithIPFS` hook:

```typescript
const result = await createRecordWithIPFS({
  data: documentData,
  holder: formData.holder as `0x${string}`,
});
```

### 4. Blockchain Registration

The hook handles:
1. Upload to IPFS
2. Generate content hash
3. Call smart contract
4. Wait for confirmation

## Hooks Used

### useAuth
- Get current user address
- Check authentication status

### useIsIssuer
- Verify user has issuer role
- Gate access to feature

### useCreateRecordWithIPFS
- Upload document to IPFS
- Register on blockchain
- Handle errors and retries

## Document Types

```typescript
enum DocumentType {
  GENERAL = 0,
  IDENTITY = 1,
  HEALTH = 2,
  FINANCIAL = 3,
  EDUCATIONAL = 4,
  LEGAL = 5,
  CERTIFICATION = 6,
  OTHER = 7,
}
```

## Error Handling

### Validation Errors

1. **Missing File**
   ```
   You must select a file to upload
   ```

2. **Invalid Holder Address**
   ```
   Invalid holder address
   ```

3. **Invalid Expiration Date**
   ```
   Invalid expiration date
   ```

### Upload Errors

1. **IPFS Upload Failed**
   - Check backend logs
   - Verify Pinata configuration

2. **Blockchain Transaction Failed**
   - Check gas balance
   - Verify contract state

## State Management

### Form State

```typescript
const [formData, setFormData] = useState({
  holder: '',
  documentType: DocumentType.OTHER,
  expirationDate: '',
  file: null as File | null,
});
```

### Upload State

```typescript
const [uploadError, setUploadError] = useState<string | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);
```

## Styling

Uses Tailwind CSS classes:
- Card layout with border
- Form spacing with `space-y-6`
- Responsive grid layout
- Loading states
- Error displays

## Success Flow

1. Form validates successfully
2. File uploads to IPFS
3. Transaction approved in wallet
4. Document registered on-chain
5. User redirected to documents list

## Code Example

```typescript
// Complete registration flow
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate inputs
  if (!formData.file) {
    setUploadError('You must select a file to upload');
    return;
  }
  
  try {
    // Convert file to base64
    const fileBase64 = await fileToBase64(formData.file);
    
    // Create document data
    const documentData = {
      name: formData.file.name,
      document: {
        documentType: DocumentType[formData.documentType].toLowerCase(),
        content: fileBase64,
        fileName: formData.file.name,
      },
    };
    
    // Upload and register
    await createRecordWithIPFS({
      data: documentData,
      holder: formData.holder as `0x${string}`,
    });
    
    // Success - redirect
    navigate('/documents');
  } catch (error) {
    setUploadError(error.message);
  }
};
```

## Testing Considerations

1. **Unit Tests**
   - Form validation
   - File processing
   - Error handling

2. **Integration Tests**
   - IPFS upload mock
   - Blockchain interaction mock
   - Full flow test

3. **E2E Tests**
   - File upload flow
   - Error scenarios
   - Success path

## Performance Optimization

1. **File Size Limits**
   - Recommend max 10MB
   - Show warning for large files

2. **Progress Feedback**
   - Show upload progress
   - Disable form during upload
   - Clear error messages

3. **Error Recovery**
   - Allow retry on failure
   - Preserve form data
   - Show specific errors

## Future Enhancements

1. **Bulk Upload**
   - Multiple files at once
   - Progress for each file

2. **File Preview**
   - PDF preview
   - Image thumbnails

3. **Template Support**
   - Predefined document types
   - Auto-fill metadata

4. **Draft Saving**
   - Save incomplete forms
   - Resume later