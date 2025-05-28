# DidIssuer Contract

## Overview

The DidIssuer contract manages the issuance of verifiable credentials on-chain. It provides a simple yet effective mechanism for tracking credential issuance while maintaining privacy through off-chain storage.

**Contract Address**: `Deployed at deployment`  
**Solidity Version**: `^0.8.19`  
**License**: MIT

## Key Features

- **Credential Issuance**: Issue verifiable credentials to DID subjects
- **Validity Tracking**: On-chain record of issued credentials
- **DID Integration**: Validates subjects through DidRegistry
- **Privacy-Preserving**: Stores only credential hashes on-chain
- **Event-Driven**: Comprehensive audit trail

## Architecture

```
Credential Data (Off-chain)
         │
         ▼
    Credential Hash
         │
         ▼
   DidIssuer Contract
         │
         ▼
   Blockchain Storage
```

## State Variables

```solidity
// Reference to DID Registry
DidRegistry private didRegistry;

// Credential issuance tracking
mapping(bytes32 => bool) private issuedCredentials;
```

## Events

```solidity
event CredentialIssued(
    string credentialType,
    string subject,
    bytes32 credentialId,
    uint256 timestamp
);
```

## Core Functions

### Constructor

```solidity
constructor(address _didRegistryAddress)
```

**Parameters:**
- `_didRegistryAddress`: Address of the DidRegistry contract

**Purpose:**
- Establishes connection to DID Registry
- Enables DID validation

### issueCredential

Issues a new verifiable credential.

```solidity
function issueCredential(
    string calldata credentialType,
    string calldata subject,
    bytes32 credentialId
) external
```

**Parameters:**
- `credentialType`: Type of credential (e.g., "HolderCredential", "IssuerCredential")
- `subject`: DID of the credential subject
- `credentialId`: Unique identifier (hash) of the credential

**Requirements:**
- Subject DID must be active in registry
- Credential ID must not already exist
- Caller should be authorized issuer (enforced off-chain)

**Events Emitted:**
- `CredentialIssued(credentialType, subject, credentialId, timestamp)`

**Gas Estimate:** ~50,000 gas

### isCredentialValid

Checks if a credential has been issued.

```solidity
function isCredentialValid(bytes32 credentialId) 
    external 
    view 
    returns (bool)
```

**Parameters:**
- `credentialId`: The credential hash to verify

**Returns:**
- `bool`: True if credential was issued

**Use Cases:**
- Credential verification
- Revocation checking (if not revoked, still valid)
- Integration with verifier contracts

## Error Handling

### Custom Errors

```solidity
error DidIssuer__InvalidSubject();      // Subject DID not active
error DidIssuer__CredentialAlreadyIssued(); // Duplicate credential
```

## Usage Patterns

### Issuing a Credential

```javascript
// 1. Create credential off-chain
const credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "HolderCredential"],
    "issuer": issuerDid,
    "subject": {
        "id": subjectDid,
        "role": "holder"
    },
    "issuanceDate": new Date().toISOString()
};

// 2. Generate credential ID (hash)
const credentialId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(credential))
);

// 3. Store credential off-chain (IPFS)
const ipfsHash = await ipfs.add(JSON.stringify(credential));

// 4. Issue on-chain
await didIssuer.issueCredential(
    "HolderCredential",
    subjectDid,
    credentialId
);
```

### Verifying a Credential

```javascript
// 1. Check on-chain validity
const isValid = await didIssuer.isCredentialValid(credentialId);

if (isValid) {
    // 2. Retrieve credential from off-chain storage
    const credential = await ipfs.cat(ipfsHash);
    
    // 3. Verify credential integrity
    const calculatedId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(credential)
    );
    
    if (calculatedId === credentialId) {
        console.log("Credential verified");
    }
}
```

### Integration with DidAuth

```javascript
// DidAuth uses DidIssuer for credential verification
async function grantRoleWithCredential(did, role, credentialId) {
    // 1. Verify credential exists
    const isValid = await didIssuer.isCredentialValid(credentialId);
    
    if (isValid) {
        // 2. Grant role in DidAuth
        await didAuth.grantRole(did, role, credentialId);
    }
}
```

## Best Practices

### For Issuers

1. **Credential Structure**
   - Follow W3C Verifiable Credentials standard
   - Include expiration dates
   - Use consistent credential types

2. **Storage Strategy**
   - Store full credentials off-chain (IPFS)
   - Only store hashes on-chain
   - Maintain credential backup

3. **Security**
   - Implement issuer authorization off-chain
   - Validate subject identity before issuance
   - Monitor for duplicate attempts

### For Developers

1. **Gas Optimization**
   ```javascript
   // Batch issuance pattern
   async function batchIssueCredentials(credentials) {
       const promises = credentials.map(cred => 
           didIssuer.issueCredential(
               cred.type,
               cred.subject,
               cred.id
           )
       );
       await Promise.all(promises);
   }
   ```

2. **Event Monitoring**
   ```javascript
   // Listen for credential issuance
   didIssuer.on("CredentialIssued", (type, subject, id, timestamp) => {
       console.log(`Credential issued: ${type} to ${subject}`);
       // Update off-chain database
       // Send notifications
   });
   ```

3. **Error Handling**
   ```javascript
   try {
       await didIssuer.issueCredential(type, subject, id);
   } catch (error) {
       if (error.message.includes("InvalidSubject")) {
           console.error("Subject DID is not active");
       } else if (error.message.includes("AlreadyIssued")) {
           console.error("Credential already exists");
       }
   }
   ```

## Security Considerations

### Authorization Model

1. **Current Implementation**
   - No on-chain issuer restrictions
   - Any address can issue credentials
   - Validation happens at integration layer

2. **Recommended Controls**
   - Implement issuer whitelist
   - Add role-based restrictions
   - Validate at application layer

### Privacy Considerations

1. **On-Chain Data**
   - Only credential hashes stored
   - No personal information on-chain
   - Subject DIDs are pseudonymous

2. **Off-Chain Storage**
   - Encrypt sensitive credentials
   - Use access-controlled storage
   - Implement retention policies

## Integration Examples

### With DocuVault

```solidity
// DocuVault can verify issuer credentials
modifier onlyCredentialedIssuer() {
    bytes32 credentialId = getIssuerCredentialId(msg.sender);
    require(
        didIssuer.isCredentialValid(credentialId),
        "Invalid issuer credential"
    );
    _;
}
```

### With Frontend Application

```javascript
class CredentialService {
    constructor(didIssuer, ipfs) {
        this.didIssuer = didIssuer;
        this.ipfs = ipfs;
    }
    
    async issueCredential(credentialData) {
        // 1. Validate subject
        const subjectActive = await this.validateSubject(credentialData.subject);
        if (!subjectActive) throw new Error("Invalid subject");
        
        // 2. Create credential
        const credential = this.createCredential(credentialData);
        
        // 3. Store off-chain
        const ipfsHash = await this.ipfs.add(JSON.stringify(credential));
        
        // 4. Issue on-chain
        const credentialId = this.hashCredential(credential);
        await this.didIssuer.issueCredential(
            credential.type[1],
            credential.subject.id,
            credentialId
        );
        
        return { credentialId, ipfsHash };
    }
}
```

## Gas Analysis

### Function Costs

| Function | Gas Cost | Notes |
|----------|----------|-------|
| `issueCredential` | ~50,000 | Includes DID check |
| `isCredentialValid` | ~1,000 | View function |

### Optimization Tips

1. **Batch Processing**
   - Group credentials by type
   - Issue in single transaction
   - Use multicall pattern

2. **Storage Efficiency**
   - Minimal on-chain data
   - No string storage
   - Efficient mappings

## Future Enhancements

### Planned Features

1. **Issuer Management**
   ```solidity
   mapping(address => bool) public authorizedIssuers;
   modifier onlyAuthorizedIssuer() {
       require(authorizedIssuers[msg.sender], "Unauthorized");
       _;
   }
   ```

2. **Credential Revocation**
   ```solidity
   mapping(bytes32 => bool) private revokedCredentials;
   function revokeCredential(bytes32 credentialId) external;
   ```

3. **Expiration Tracking**
   ```solidity
   struct CredentialRecord {
       bool issued;
       uint256 expirationDate;
   }
   ```

4. **Batch Operations**
   ```solidity
   function batchIssueCredentials(
       string[] calldata types,
       string[] calldata subjects,
       bytes32[] calldata ids
   ) external;
   ```

## Deployment Considerations

### Prerequisites

1. Deploy DidRegistry first
2. Note DidRegistry address
3. Deploy DidIssuer with registry address

### Post-Deployment

1. **Verification**
   ```javascript
   const registryAddress = await didIssuer.didRegistry();
   console.log("Connected to registry:", registryAddress);
   ```

2. **Initial Setup**
   - Issue initial admin credentials
   - Configure trusted issuers in DidAuth
   - Test credential flow

3. **Monitoring**
   - Set up event listeners
   - Monitor gas usage
   - Track credential metrics

## Common Patterns

### Credential Lifecycle

```javascript
// 1. Issue
const credentialId = await issueCredential(data);

// 2. Verify
const isValid = await didIssuer.isCredentialValid(credentialId);

// 3. Use in DidAuth
await didAuth.grantRole(did, role, credentialId);

// 4. Future: Revoke
// await didIssuer.revokeCredential(credentialId);
```

### Error Recovery

```javascript
async function safeIssueCredential(type, subject, id, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await didIssuer.issueCredential(type, subject, id);
        } catch (error) {
            if (error.message.includes("AlreadyIssued")) {
                // Credential exists, consider it success
                return { alreadyExists: true };
            }
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
```