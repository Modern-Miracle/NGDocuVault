# DocuVault Contract

## Overview

DocuVault is the core document management contract implementing the issuer-holder-verifier model. It provides comprehensive document lifecycle management with privacy-preserving consent mechanisms and role-based access control.

**Contract Address**: `Deployed at deployment`  
**Solidity Version**: `^0.8.17`  
**License**: MIT  
**Inherits**: `Ownable`, `Pausable`, `AccessControl`

## Key Features

- **Document Registration**: Secure on-chain document hash storage
- **Multi-Party Verification**: Issuer and verifier roles for trust
- **Consent Management**: Granular access control with time bounds
- **Batch Operations**: Gas-efficient bulk processing
- **Emergency Controls**: Pausable functionality for security
- **Event-Driven Architecture**: Comprehensive audit trail

## Enumerations

### Consent States

```solidity
enum Consent {
    PENDING,    // Request submitted, awaiting response
    GRANTED,    // Access granted by holder
    REJECTED    // Access denied by holder
}
```

### Document Types

```solidity
enum DocumentType {
    GENERIC,
    BIRTH_CERTIFICATE,
    DEATH_CERTIFICATE,
    MARRIAGE_CERTIFICATE,
    ID_CARD,
    PASSPORT,
    OTHER
}
```

## Data Structures

### Document

```solidity
struct Document {
    address issuer;           // Who issued the document
    address holder;           // Who owns the document
    uint256 issuanceDate;     // Registration timestamp
    uint256 expirationDate;   // Document expiration
    bool isVerified;          // Issuer verification status
    DocumentType documentType; // Document category
}
```

### ShareRequest

```solidity
struct ShareRequest {
    Consent consent;          // Current consent status
    uint256 validUntil;       // Consent expiration
}
```

## State Variables

### Storage Mappings

```solidity
// Core document storage
mapping(bytes32 => Document) public documents;

// Holder's document list
mapping(address => bytes32[]) private holderDocuments;

// Consent management
mapping(bytes32 => mapping(address => ShareRequest)) public shareRequests;

// DID integration
DidAuth public didAuth;
```

## Events

### User Management Events

```solidity
event IssuerRegistered(address indexed issuer, uint256 timestamp);
event AdminRegistered(address indexed admin, uint256 timestamp);
event VerifierAdded(address indexed verifier, uint256 timestamp);
event UserRegistered(bytes32 indexed role, string did, uint256 timestamp);
```

### Document Lifecycle Events

```solidity
event DocumentRegistered(
    bytes32 indexed documentId,
    address indexed issuer,
    address indexed holder,
    uint256 timestamp
);

event DocumentVerified(
    bytes32 indexed documentId,
    address indexed verifier,
    uint256 timestamp
);

event DocumentBatchVerified(
    bytes32[] indexed documentIds,
    uint256 count,
    address indexed verifier,
    uint256 timestamp
);

event DocumentUpdated(
    bytes32 indexed oldDocumentId,
    bytes32 indexed newDocumentId,
    address indexed issuer,
    uint256 timestamp
);
```

### Access Control Events

```solidity
event DocumentShared(
    bytes32 indexed documentId,
    address indexed holder,
    uint256 timestamp
);

event ShareRequested(
    bytes32 indexed documentId,
    address indexed requester,
    uint256 timestamp
);

event ConsentGranted(
    bytes32 indexed documentId,
    address indexed requester,
    uint256 timestamp
);

event ConsentRevoked(
    bytes32 indexed documentId,
    address indexed requester,
    uint256 timestamp
);
```

## Core Functions

### Document Registration

#### registerDocument

Registers a new document on-chain.

```solidity
function registerDocument(
    string memory _cid,
    bytes32 _documentHash,
    DocumentType _documentType
) external whenNotPaused
```

**Parameters:**
- `_cid`: IPFS content identifier
- `_documentHash`: Hash of document content
- `_documentType`: Category of document

**Requirements:**
- Contract not paused
- Valid CID and hash
- Caller has holder role

**Events Emitted:**
- `DocumentRegistered(documentId, issuer, holder, timestamp)`

**Returns:**
- `bytes32`: Unique document ID

**Gas Estimate:** ~120,000 gas

#### registerDocuments

Batch register multiple documents.

```solidity
function registerDocuments(
    string[] memory _cids,
    bytes32[] memory _hashes,
    DocumentType[] memory _types
) external whenNotPaused
```

**Parameters:**
- `_cids`: Array of IPFS CIDs
- `_hashes`: Array of document hashes
- `_types`: Array of document types

**Requirements:**
- Arrays must have equal length
- All individual requirements apply

**Gas Optimization:**
- Saves ~30% gas vs individual registrations

### Document Verification

#### verifyDocument

Verifies a single document.

```solidity
function verifyDocument(
    bytes32 _documentId
) external whenNotPaused onlyIssuer
```

**Parameters:**
- `_documentId`: Document to verify

**Requirements:**
- Caller has issuer role
- Document exists and unverified
- Contract not paused

**Events Emitted:**
- `DocumentVerified(documentId, verifier, timestamp)`

#### verifyDocuments

Batch verify multiple documents.

```solidity
function verifyDocuments(
    bytes32[] memory _documentIds
) external whenNotPaused onlyIssuer
```

**Benefits:**
- Efficient bulk verification
- Single transaction for multiple documents
- Reduced gas costs

### Access Management

#### requestVerification

Request document verification from issuer.

```solidity
function requestVerification(
    bytes32 _documentId
) external whenNotPaused onlyHolder(_documentId)
```

**Parameters:**
- `_documentId`: Document requiring verification

**Requirements:**
- Caller must be document holder
- Document must be unverified

**Events Emitted:**
- `VerificationRequested(documentId, holder, timestamp)`

#### shareDocument

Grant access to a document.

```solidity
function shareDocument(
    bytes32 _documentId,
    address _requester,
    uint256 _validUntil
) external whenNotPaused onlyHolder(_documentId)
```

**Parameters:**
- `_documentId`: Document to share
- `_requester`: Address to grant access
- `_validUntil`: Access expiration timestamp

**Requirements:**
- Caller must be document holder
- Valid future expiration date

**Events Emitted:**
- `ConsentGranted(documentId, requester, timestamp)`

#### revokeAccess

Revoke previously granted access.

```solidity
function revokeAccess(
    bytes32 _documentId,
    address _requester
) external whenNotPaused onlyHolder(_documentId)
```

**Events Emitted:**
- `ConsentRevoked(documentId, requester, timestamp)`

### Query Functions

#### getDocument

Retrieve document details.

```solidity
function getDocument(
    bytes32 _documentId
) external view returns (
    address issuer,
    address holder,
    uint256 issuanceDate,
    uint256 expirationDate,
    bool isVerified,
    DocumentType documentType
)
```

#### getDocumentInfo

Get extended document information.

```solidity
function getDocumentInfo(
    bytes32 _documentId
) external view returns (
    string memory cid,
    bytes32 documentHash,
    address issuer,
    address holder,
    uint256 issuanceDate,
    bool isVerified
)
```

#### getUserDocuments

Get all documents for a holder.

```solidity
function getUserDocuments(
    address _holder
) external view returns (bytes32[] memory)
```

#### getConsentStatus

Check consent status for a requester.

```solidity
function getConsentStatus(
    bytes32 _documentId,
    address _requester
) external view returns (Consent consent, uint256 validUntil)
```

### Administrative Functions

#### pause/unpause

Emergency pause functionality.

```solidity
function pause() external onlyAdmin
function unpause() external onlyAdmin
```

**Requirements:**
- Caller must have admin role
- Affects all state-changing operations

#### registerAdmin

Register a new administrator.

```solidity
function registerAdmin(address _admin) external onlyAdmin
```

**Events Emitted:**
- `AdminRegistered(admin, timestamp)`

## Security Model

### Role-Based Access

1. **Admin Role**
   - System configuration
   - Emergency controls
   - Role management

2. **Issuer Role**
   - Document verification
   - Credential issuance
   - Bulk operations

3. **Holder Role**
   - Document registration
   - Access management
   - Consent control

4. **Verifier Role**
   - Document validation
   - Verification requests

### Security Features

1. **Pausable Operations**
   - Emergency stop mechanism
   - Protects against exploits
   - Admin-controlled

2. **Input Validation**
   - Hash format verification
   - Address validation
   - Timestamp checks

3. **Access Control**
   - Role-based permissions
   - Time-bound access
   - Explicit consent

## Usage Examples

### Document Registration Flow

```javascript
// 1. Upload to IPFS
const ipfsResult = await ipfs.add(documentBuffer);
const cid = ipfsResult.cid.toString();

// 2. Calculate document hash
const documentHash = ethers.utils.keccak256(documentBuffer);

// 3. Register on-chain
const tx = await docuVault.registerDocument(
    cid,
    documentHash,
    DocumentType.BIRTH_CERTIFICATE
);

const receipt = await tx.wait();
const documentId = receipt.events[0].args.documentId;
```

### Verification Workflow

```javascript
// Holder requests verification
await docuVault.requestVerification(documentId);

// Issuer verifies document
await docuVault.connect(issuerSigner).verifyDocument(documentId);

// Check verification status
const doc = await docuVault.getDocument(documentId);
console.log("Verified:", doc.isVerified);
```

### Consent Management

```javascript
// Grant access for 30 days
const validUntil = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
await docuVault.shareDocument(documentId, requesterAddress, validUntil);

// Check consent
const consent = await docuVault.getConsentStatus(documentId, requesterAddress);
if (consent.consent === Consent.GRANTED && consent.validUntil > Date.now() / 1000) {
    // Access granted
}

// Revoke access
await docuVault.revokeAccess(documentId, requesterAddress);
```

## Gas Optimization Strategies

### Batch Operations

```javascript
// Inefficient: Multiple transactions
for (const doc of documents) {
    await docuVault.registerDocument(doc.cid, doc.hash, doc.type);
}

// Efficient: Single transaction
const cids = documents.map(d => d.cid);
const hashes = documents.map(d => d.hash);
const types = documents.map(d => d.type);
await docuVault.registerDocuments(cids, hashes, types);
```

### Storage Optimization

1. **Packed Structs**: Document struct optimized for storage
2. **Minimal Storage**: Use events for historical data
3. **Efficient Mappings**: Direct access patterns

## Integration Patterns

### With IPFS

```javascript
class DocumentService {
    async uploadAndRegister(file, documentType) {
        // 1. Upload to IPFS
        const ipfsHash = await this.ipfs.add(file);
        
        // 2. Calculate hash
        const hash = ethers.utils.keccak256(file);
        
        // 3. Register on-chain
        const tx = await this.docuVault.registerDocument(
            ipfsHash,
            hash,
            documentType
        );
        
        return tx;
    }
}
```

### With Frontend

```javascript
// React hook for document management
function useDocumentManagement() {
    const { signer } = useWeb3();
    const contract = useDocuVaultContract(signer);
    
    const registerDocument = useCallback(async (documentData) => {
        return await contract.registerDocument(
            documentData.cid,
            documentData.hash,
            documentData.type
        );
    }, [contract]);
    
    return { registerDocument };
}
```

## Error Handling

### Custom Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `DocuVault__NotAdmin` | Caller lacks admin role | Grant admin role via DidAuth |
| `DocuVault__NotIssuer` | Caller lacks issuer role | Grant issuer role |
| `DocuVault__NotHolder` | Caller not document owner | Use correct account |
| `DocuVault__InvalidHash` | Invalid document hash | Verify hash format |
| `DocuVault__AlreadyRegistered` | Document already exists | Check before registering |
| `DocuVault__NotVerified` | Document not verified | Request verification |
| `DocuVault__Expired` | Document expired | Register new document |

## Best Practices

### For Holders

1. **Document Management**
   - Keep IPFS CIDs secure
   - Monitor document expiration
   - Manage consent carefully

2. **Privacy**
   - Share minimum required access
   - Set appropriate expiration times
   - Revoke unused access

### For Issuers

1. **Verification Process**
   - Verify document authenticity off-chain
   - Use batch operations for efficiency
   - Monitor verification requests

2. **Security**
   - Protect issuer credentials
   - Implement verification workflows
   - Audit verification history

### For Developers

1. **Gas Efficiency**
   - Use batch operations
   - Minimize storage writes
   - Cache read operations

2. **Error Handling**
   - Implement comprehensive try-catch
   - Handle all custom errors
   - Provide user feedback

## Deployment and Configuration

### Constructor

```solidity
constructor(address _didAuth) Ownable(msg.sender)
```

**Parameters:**
- `_didAuth`: Address of DidAuth contract

### Post-Deployment

1. **Configure Roles**
   ```javascript
   await didAuth.grantRole(adminDid, ADMIN_ROLE, credentialId);
   await didAuth.grantRole(issuerDid, ISSUER_ROLE, credentialId);
   ```

2. **Set Parameters**
   - Configure trusted issuers
   - Set system parameters
   - Initialize first admin

3. **Testing**
   - Verify role assignments
   - Test document flow
   - Confirm event emissions

## Audit Considerations

1. **Access Control**
   - Role verification at every step
   - No privilege escalation paths
   - Clear permission boundaries

2. **Data Integrity**
   - Immutable document records
   - Hash verification
   - Timestamp validation

3. **Emergency Response**
   - Pause mechanism tested
   - Recovery procedures documented
   - Admin succession plan