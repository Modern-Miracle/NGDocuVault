# DidVerifier Contract

## Overview

The DidVerifier contract manages credential verification by validating issuers and subjects. It implements a trust framework where specific issuers are authorized to issue certain types of credentials.

**Contract Address**: `Deployed at deployment`  
**Solidity Version**: `^0.8.19`  
**License**: MIT  
**Author**: @mengefeng

## Key Features

- **Trusted Issuer Management**: Whitelist issuers for specific credential types
- **Credential Verification**: Validate credentials based on issuer trust
- **DID Subject Validation**: Ensure subjects are active DIDs
- **Flexible Trust Model**: Different issuers for different credential types
- **Administrative Controls**: Manage issuer trust status

## Architecture

```
Credential Verification Flow:
    Credential
        │
        ├── Credential Type
        ├── Issuer Address
        └── Subject DID
              │
              ▼
        DidVerifier
              │
        ┌─────┴─────┐
        ▼           ▼
    Trust Check  DID Check
        │           │
        └─────┬─────┘
              ▼
         Valid/Invalid
```

## State Variables

```solidity
// Reference to DID Registry
DidRegistry private didRegistry;

// Trusted issuer mapping: credentialType => issuer => trusted
mapping(string => mapping(address => bool)) private trustedIssuers;
```

## Events

```solidity
event IssuerTrustStatusUpdated(
    string credentialType,
    address issuer,
    bool trusted
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

### setIssuerTrustStatus

Manages trusted issuer status for credential types.

```solidity
function setIssuerTrustStatus(
    string calldata credentialType,
    address issuer,
    bool trusted
) external
```

**Parameters:**
- `credentialType`: Type of credential (e.g., "HealthCareCredential")
- `issuer`: Address of the issuer
- `trusted`: Whether to trust or untrust the issuer

**Requirements:**
- Issuer address must not be zero
- Caller should have admin privileges (enforced at integration layer)

**Events Emitted:**
- `IssuerTrustStatusUpdated(credentialType, issuer, trusted)`

**Use Cases:**
- Add new trusted issuers
- Revoke issuer privileges
- Update trust relationships

**Gas Estimate:** ~30,000 gas

### isIssuerTrusted

Checks if an issuer is trusted for a credential type.

```solidity
function isIssuerTrusted(
    string calldata credentialType,
    address issuer
) public view returns (bool)
```

**Parameters:**
- `credentialType`: Type of credential to check
- `issuer`: Address of the issuer

**Returns:**
- `bool`: True if issuer is trusted for the credential type

**Use Cases:**
- Pre-verification checks
- UI display of trusted issuers
- Integration validations

### verifyCredential

Verifies a credential by checking issuer trust and subject validity.

```solidity
function verifyCredential(
    string calldata credentialType,
    address issuer,
    string calldata subject
) external view returns (bool)
```

**Parameters:**
- `credentialType`: Type of credential being verified
- `issuer`: Address that issued the credential
- `subject`: DID of the credential subject

**Returns:**
- `bool`: True if credential passes all checks

**Verification Steps:**
1. Validates subject DID is active
2. Checks issuer is trusted for credential type
3. Returns verification result

**Reverts:**
- `DidVerifier__InvalidCredential`: Subject DID not active
- `DidVerifier__UntrustedIssuer`: Issuer not trusted

**Gas Estimate:** ~10,000 gas

## Error Handling

### Custom Errors

```solidity
error DidVerifier__InvalidIssuer();     // Zero address issuer
error DidVerifier__UntrustedIssuer();   // Issuer not in trust list
error DidVerifier__InvalidCredential();  // Subject DID not active
```

## Usage Examples

### Setting Up Trusted Issuers

```javascript
// Contract deployment and setup
const didVerifier = await DidVerifier.deploy(didRegistryAddress);

// Add trusted healthcare issuer
await didVerifier.setIssuerTrustStatus(
    "HealthCareCredential",
    hospitalAddress,
    true
);

// Add trusted education issuer
await didVerifier.setIssuerTrustStatus(
    "EducationCredential",
    universityAddress,
    true
);

// Remove untrusted issuer
await didVerifier.setIssuerTrustStatus(
    "HealthCareCredential",
    revokedIssuerAddress,
    false
);
```

### Verifying Credentials

```javascript
// Verify a healthcare credential
try {
    const isValid = await didVerifier.verifyCredential(
        "HealthCareCredential",
        hospitalAddress,
        patientDid
    );
    
    if (isValid) {
        console.log("Credential verified successfully");
    }
} catch (error) {
    if (error.message.includes("UntrustedIssuer")) {
        console.error("Issuer not trusted for this credential type");
    } else if (error.message.includes("InvalidCredential")) {
        console.error("Subject DID is not active");
    }
}
```

### Integration with DidAuth

```javascript
// DidAuth integration for credential verification
async function verifyCredentialForRole(credentialType, issuer, subject) {
    // 1. Verify credential with DidVerifier
    const isValid = await didVerifier.verifyCredential(
        credentialType,
        issuer,
        subject
    );
    
    // 2. If valid, proceed with role assignment
    if (isValid) {
        await didAuth.grantRole(subject, role, credentialId);
    }
}
```

## Trust Model

### Credential Type Hierarchy

```
CredentialType
    │
    ├── HealthCareCredential
    │   └── Trusted Issuers: [Hospital A, Clinic B]
    │
    ├── EducationCredential
    │   └── Trusted Issuers: [University X, College Y]
    │
    └── IdentityCredential
        └── Trusted Issuers: [Government Agency]
```

### Trust Management Best Practices

1. **Segregation of Credential Types**
   - Different issuers for different domains
   - Prevents cross-domain credential abuse
   - Clear trust boundaries

2. **Regular Audits**
   - Monitor issuer behavior
   - Review trust relationships
   - Remove compromised issuers

3. **Governance Process**
   - Document trust decisions
   - Multi-signature for critical changes
   - Time-delayed trust revocation

## Security Considerations

### Access Control

**Current Implementation:**
- No on-chain access control for trust management
- Any address can modify trust status
- Security enforced at integration layer

**Recommended Implementation:**
```solidity
modifier onlyAdmin() {
    require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
    _;
}

function setIssuerTrustStatus(...) external onlyAdmin {
    // ... existing logic
}
```

### Trust Validation

1. **Zero Address Check**
   - Prevents accidental trust of zero address
   - Protects against initialization errors

2. **Event Emission**
   - All trust changes are logged
   - Enables off-chain monitoring
   - Provides audit trail

## Integration Patterns

### With Frontend

```javascript
class VerifierService {
    constructor(didVerifier, didRegistry) {
        this.didVerifier = didVerifier;
        this.didRegistry = didRegistry;
    }
    
    async getTrustedIssuers(credentialType) {
        // Listen to past events to build issuer list
        const filter = this.didVerifier.filters.IssuerTrustStatusUpdated(
            credentialType
        );
        const events = await this.didVerifier.queryFilter(filter);
        
        const trustedIssuers = new Map();
        events.forEach(event => {
            if (event.args.trusted) {
                trustedIssuers.set(event.args.issuer, true);
            } else {
                trustedIssuers.delete(event.args.issuer);
            }
        });
        
        return Array.from(trustedIssuers.keys());
    }
    
    async verifyCredentialWithMetadata(credential) {
        const { type, issuer, subject } = credential;
        
        try {
            const isValid = await this.didVerifier.verifyCredential(
                type,
                issuer,
                subject
            );
            
            return {
                valid: isValid,
                issuerTrusted: true,
                subjectActive: true
            };
        } catch (error) {
            return {
                valid: false,
                issuerTrusted: !error.message.includes("UntrustedIssuer"),
                subjectActive: !error.message.includes("InvalidCredential"),
                error: error.message
            };
        }
    }
}
```

### With Smart Contracts

```solidity
contract CredentialGatedContract {
    DidVerifier public didVerifier;
    
    modifier requiresCredential(string memory credentialType) {
        string memory userDid = getDidForUser(msg.sender);
        address issuer = getCredentialIssuer(msg.sender, credentialType);
        
        require(
            didVerifier.verifyCredential(credentialType, issuer, userDid),
            "Invalid credential"
        );
        _;
    }
    
    function accessRestrictedFunction() 
        external 
        requiresCredential("PremiumMemberCredential") 
    {
        // Function logic
    }
}
```

## Gas Optimization

### Efficient Trust Queries

```javascript
// Inefficient: Multiple calls
const isHealthTrusted = await didVerifier.isIssuerTrusted("HealthCareCredential", issuer);
const isEducationTrusted = await didVerifier.isIssuerTrusted("EducationCredential", issuer);

// Efficient: Batch with multicall
const results = await multicall([
    didVerifier.interface.encodeFunctionData("isIssuerTrusted", ["HealthCareCredential", issuer]),
    didVerifier.interface.encodeFunctionData("isIssuerTrusted", ["EducationCredential", issuer])
]);
```

### Storage Optimization

- Uses nested mappings for O(1) lookups
- No arrays or loops in verification
- Minimal storage per trust relationship

## Monitoring and Maintenance

### Event Monitoring

```javascript
// Monitor trust changes
didVerifier.on("IssuerTrustStatusUpdated", (type, issuer, trusted) => {
    console.log(`Trust updated: ${type} - ${issuer} - ${trusted}`);
    
    // Alert on critical changes
    if (type === "IdentityCredential" && !trusted) {
        sendAlert("Critical issuer revoked", { type, issuer });
    }
});
```

### Trust Audit

```javascript
async function auditTrustedIssuers() {
    const credentialTypes = [
        "HealthCareCredential",
        "EducationCredential",
        "IdentityCredential"
    ];
    
    const audit = {};
    
    for (const type of credentialTypes) {
        const issuers = await getTrustedIssuers(type);
        audit[type] = {
            count: issuers.length,
            issuers: issuers
        };
    }
    
    return audit;
}
```

## Future Enhancements

### Planned Features

1. **Time-Bound Trust**
   ```solidity
   struct TrustRelationship {
       bool trusted;
       uint256 validUntil;
   }
   ```

2. **Multi-Signature Trust Management**
   ```solidity
   mapping(bytes32 => uint256) public trustProposals;
   function proposeTrustChange(...) external;
   function approveTrustChange(...) external;
   ```

3. **Credential Schema Validation**
   ```solidity
   mapping(string => string) public credentialSchemas;
   function validateCredentialSchema(...) external view;
   ```

4. **Issuer Reputation**
   ```solidity
   struct IssuerStats {
       uint256 totalIssued;
       uint256 totalRevoked;
       uint256 trustScore;
   }
   ```

## Deployment Guide

### Prerequisites

1. Deploy DidRegistry
2. Note DidRegistry address
3. Prepare initial trusted issuers list

### Deployment Steps

```javascript
// 1. Deploy contract
const DidVerifier = await ethers.getContractFactory("DidVerifier");
const didVerifier = await DidVerifier.deploy(didRegistryAddress);
await didVerifier.deployed();

// 2. Configure initial trust relationships
const initialTrust = [
    { type: "HolderCredential", issuer: holderIssuerAddress },
    { type: "IssuerCredential", issuer: issuerIssuerAddress },
    { type: "VerifierCredential", issuer: verifierIssuerAddress }
];

for (const trust of initialTrust) {
    await didVerifier.setIssuerTrustStatus(
        trust.type,
        trust.issuer,
        true
    );
}

// 3. Verify configuration
for (const trust of initialTrust) {
    const isTrusted = await didVerifier.isIssuerTrusted(
        trust.type,
        trust.issuer
    );
    console.log(`${trust.type} - ${trust.issuer}: ${isTrusted}`);
}
```

### Post-Deployment

1. **Integration Testing**
   - Test credential verification flow
   - Verify trust relationships
   - Check error handling

2. **Access Control Setup**
   - Implement admin controls
   - Configure multi-sig if needed
   - Document governance process

3. **Monitoring Setup**
   - Deploy event listeners
   - Configure alerts
   - Set up audit schedules