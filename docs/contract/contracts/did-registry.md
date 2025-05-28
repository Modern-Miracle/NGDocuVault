# DidRegistry Contract

## Overview

The DidRegistry contract manages Decentralized Identifiers (DIDs) on-chain, providing a foundational identity layer for the Docu ecosystem. It implements efficient storage patterns and follows W3C DID specifications.

**Contract Address**: `Deployed at deployment`  
**Solidity Version**: `^0.8.19`  
**License**: MIT

## Key Features

- **DID Registration**: Create new DIDs linked to Ethereum addresses
- **DID Updates**: Modify DID documents and public keys
- **DID Deactivation**: Permanently deactivate DIDs
- **Efficient Storage**: Optimized mapping structures
- **Gas Optimization**: Packed structs and minimal storage operations

## Contract Structure

### State Variables

```solidity
struct DIDDocument {
    address subject;        // Controller/subject address (20 bytes)
    uint40 lastUpdated;     // Timestamp of last update (5 bytes)
    bool active;            // Active status flag (1 byte)
    string publicKey;       // Public key string
    string document;        // Document string
}

// Primary storage mappings
mapping(bytes32 => DIDDocument) internal didData;
mapping(address => bytes32) internal addressToDidHash;
mapping(string => bytes32) internal didToHash;
mapping(bytes32 => string) internal hashToDid;
```

### Events

```solidity
event DIDRegistered(string did, address indexed controller);
event DIDUpdated(string did, uint256 indexed timestamp);
event DIDDeactivated(string did, uint256 indexed timestamp);
```

### Errors

```solidity
error DidRegistry__Unauthorized();
error DidRegistry__InvalidDID();
error DidRegistry__DeactivatedDID();
error DidRegistry__DIDAlreadyRegistered();
```

## Core Functions

### registerDid

Registers a new DID with associated document and public key.

```solidity
function registerDid(
    string calldata did,
    string calldata document,
    string calldata publicKey
) external
```

**Parameters:**
- `did`: The DID identifier (format: did:method:network:address)
- `document`: The DID document containing service endpoints and other metadata
- `publicKey`: The public key associated with the DID

**Requirements:**
- DID must not already exist
- Caller must be the subject of the DID
- DID format must be valid

**Events Emitted:**
- `DIDRegistered(did, msg.sender)`

**Gas Estimate:** ~150,000 gas

### updateDid

Updates an existing DID document.

```solidity
function updateDid(
    string calldata did,
    string calldata document
) external
```

**Parameters:**
- `did`: The DID to update
- `document`: The new DID document

**Requirements:**
- DID must exist and be active
- Caller must be the DID subject
- Document must be valid

**Events Emitted:**
- `DIDUpdated(did, block.timestamp)`

**Gas Estimate:** ~80,000 gas

### updatePublicKey

Updates only the public key of a DID.

```solidity
function updatePublicKey(
    string calldata did,
    string calldata newPublicKey
) external
```

**Parameters:**
- `did`: The DID to update
- `newPublicKey`: The new public key

**Requirements:**
- DID must exist and be active
- Caller must be the DID subject

**Events Emitted:**
- `DIDUpdated(did, block.timestamp)`

**Gas Estimate:** ~60,000 gas

### deactivateDid

Permanently deactivates a DID.

```solidity
function deactivateDid(string calldata did) external
```

**Parameters:**
- `did`: The DID to deactivate

**Requirements:**
- DID must exist and be active
- Caller must be the DID subject
- **Warning**: This action is irreversible

**Events Emitted:**
- `DIDDeactivated(did, block.timestamp)`

**Gas Estimate:** ~40,000 gas

## View Functions

### getDID

Retrieves complete DID information.

```solidity
function getDID(string calldata did) 
    external 
    view 
    returns (
        address subject,
        uint256 lastUpdated,
        bool active,
        string memory publicKey,
        string memory document
    )
```

### getSubject

Gets the subject address of a DID.

```solidity
function getSubject(string calldata did) 
    external 
    view 
    returns (address)
```

### isActive

Checks if a DID is active.

```solidity
function isActive(string calldata did) 
    external 
    view 
    returns (bool)
```

### getDIDByAddress

Retrieves DID associated with an address.

```solidity
function getDIDByAddress(address subject) 
    external 
    view 
    returns (string memory)
```

## Usage Examples

### Registering a DID

```javascript
const did = "did:ethr:mainnet:0x742d35Cc6634C0532925a3b844Bc9e7595f6E123";
const document = JSON.stringify({
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": did,
    "verificationMethod": [{
        "id": `${did}#keys-1`,
        "type": "EcdsaSecp256k1RecoveryMethod2020",
        "controller": did,
        "publicKeyHex": "0x..."
    }]
});
const publicKey = "0x04..."; // 65 bytes uncompressed public key

await didRegistry.registerDid(did, document, publicKey);
```

### Updating a DID Document

```javascript
const newDocument = JSON.stringify({
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": did,
    "verificationMethod": [...],
    "service": [{
        "id": `${did}#profile`,
        "type": "ProfileService",
        "serviceEndpoint": "https://profile.example.com"
    }]
});

await didRegistry.updateDid(did, newDocument);
```

### Checking DID Status

```javascript
const isActive = await didRegistry.isActive(did);
if (!isActive) {
    console.log("DID has been deactivated");
}

const didInfo = await didRegistry.getDID(did);
console.log("Subject:", didInfo.subject);
console.log("Last Updated:", new Date(didInfo.lastUpdated * 1000));
```

## Security Considerations

### 1. Authorization
- Only the DID subject can update or deactivate their DID
- No admin override capabilities by design
- Subject verification through msg.sender

### 2. Data Validation
- DID format validation should be done off-chain
- Document structure validation is caller's responsibility
- Public key format verification recommended

### 3. Privacy
- DID documents are public on-chain
- Sensitive data should not be stored in documents
- Use service endpoints for private data

### 4. Immutability
- Deactivation is permanent and irreversible
- Historical data accessible through events
- No delete functionality to maintain audit trail

## Gas Optimization

### Storage Patterns

1. **Hashed Keys**: Uses bytes32 hashes instead of string keys
2. **Packed Structs**: DIDDocument struct optimized for storage
3. **Minimal Updates**: Separate functions for document vs key updates

### Best Practices

1. **Batch Operations**: Register multiple DIDs in one transaction when possible
2. **Off-chain Validation**: Validate DID format and document structure before calling
3. **Event Monitoring**: Use events instead of repeated view calls

## Integration Guide

### With DocuVault

```solidity
// DocuVault checks DID status before operations
string memory holderDid = didRegistry.getDIDByAddress(msg.sender);
require(didRegistry.isActive(holderDid), "Inactive DID");
```

### With DidAuth

```solidity
// DidAuth verifies DID ownership
address subject = didRegistry.getSubject(did);
require(subject == msg.sender, "Not DID owner");
```

### Event Monitoring

```javascript
// Listen for DID registrations
didRegistry.on("DIDRegistered", (did, controller) => {
    console.log(`New DID registered: ${did} by ${controller}`);
});
```

## Deployment Considerations

### Constructor Parameters
None - The contract is designed to be deployed without configuration.

### Post-Deployment Setup
1. No initial configuration required
2. Contract is immediately ready for use
3. Consider registering contract DID for system operations

### Upgrade Path
- Contract is designed to be immutable
- Migration possible through event replay
- New versions can reference old registry

## Common Patterns

### DID Resolution

```javascript
async function resolveDID(didOrAddress) {
    let did;
    if (didOrAddress.startsWith("did:")) {
        did = didOrAddress;
    } else {
        did = await didRegistry.getDIDByAddress(didOrAddress);
    }
    
    const didInfo = await didRegistry.getDID(did);
    return {
        did,
        ...didInfo,
        document: JSON.parse(didInfo.document)
    };
}
```

### DID Validation

```javascript
function validateDIDFormat(did) {
    const pattern = /^did:[a-z]+:[a-z]+:0x[a-fA-F0-9]{40}$/;
    return pattern.test(did);
}
```

## Error Handling

### Common Errors

1. **DidRegistry__Unauthorized**
   - Caller is not the DID subject
   - Solution: Ensure correct account is connected

2. **DidRegistry__InvalidDID**
   - DID format is incorrect
   - Solution: Validate DID format before calling

3. **DidRegistry__DeactivatedDID**
   - Attempting to update deactivated DID
   - Solution: Check isActive before updates

4. **DidRegistry__DIDAlreadyRegistered**
   - DID already exists
   - Solution: Use getDID to check existence