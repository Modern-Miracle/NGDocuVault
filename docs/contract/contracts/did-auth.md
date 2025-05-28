# DidAuth Contract

## Overview

The DidAuth contract implements DID-based authentication and authorization with credential verification. It serves as the access control layer for the Docu ecosystem, managing roles and permissions through verifiable credentials.

**Contract Address**: `Deployed at deployment`  
**Solidity Version**: `^0.8.19`  
**License**: MIT

## Key Features

- **Role-Based Access Control**: Hierarchical role management system
- **Credential-Based Authentication**: Roles backed by verifiable credentials
- **Trusted Issuer Management**: Control which issuers can grant roles
- **DID Integration**: Seamless integration with DidRegistry
- **Event-Driven Auditing**: Comprehensive authentication logs

## Contract Dependencies

```solidity
import {DidRegistry} from "./DidRegistry.sol";
import {DidVerifier} from "./DidVerifier.sol";
import {DidIssuer} from "./DidIssuer.sol";
```

## Role Definitions

### System Roles

```solidity
bytes32 public constant DEFAULT_ADMIN_ROLE = keccak256("DEFAULT_ADMIN_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
bytes32 public constant HOLDER_ROLE = keccak256("HOLDER_ROLE");
```

### Credential Types

```solidity
string public constant HOLDER_CREDENTIAL = "HolderCredential";
string public constant ISSUER_CREDENTIAL = "IssuerCredential";
string public constant VERIFIER_CREDENTIAL = "VerifierCredential";
```

## State Variables

```solidity
struct Role {
    address verifiedBy;     // Who granted the role
    bool isVerified;        // Active status
}

// Core storage
mapping(bytes32 => mapping(bytes32 => Role)) private didRoles;
mapping(bytes32 => string) private roleRequirements;
mapping(string => mapping(address => bool)) private trustedIssuers;
```

## Events

```solidity
event RoleGranted(string did, bytes32 role, uint256 timestamp);
event RoleRevoked(string did, bytes32 role, uint256 timestamp);
event AuthenticationSuccessful(string did, bytes32 role, uint256 timestamp);
event AuthenticationFailed(string did, bytes32 role, uint256 timestamp);
event CredentialVerified(string did, string credentialType, bytes32 credentialId, uint256 timestamp);
event CredentialVerificationFailed(string did, string credentialType, bytes32 credentialId, uint256 timestamp);
```

## Core Functions

### Constructor

```solidity
constructor(
    address _didRegistryAddress,
    address _verifierAddress,
    address _issuerAddress,
    address _owner
)
```

**Parameters:**
- `_didRegistryAddress`: Address of the DidRegistry contract
- `_verifierAddress`: Address of the DidVerifier contract
- `_issuerAddress`: Address of the DidIssuer contract
- `_owner`: Initial admin address

**Initialization:**
1. Sets up contract dependencies
2. Configures role requirements
3. Grants admin roles to owner
4. Sets owner as trusted issuer

### authenticate

Authenticates a DID and verifies its role.

```solidity
function authenticate(
    string memory did,
    bytes32 role
) public view returns (bool)
```

**Parameters:**
- `did`: The DID to authenticate
- `role`: The role to verify

**Returns:**
- `bool`: True if authentication successful

**Logic Flow:**
1. Validates DID format and activity
2. Checks if DID has the requested role
3. Emits authentication result event

### grantRole

Grants a role to a DID with credential verification.

```solidity
function grantRole(
    string memory did,
    bytes32 role,
    bytes32 credentialId
) public onlyActiveDID(did)
```

**Parameters:**
- `did`: The DID to grant role to
- `role`: The role to grant
- `credentialId`: Supporting credential ID

**Requirements:**
- Caller must have admin role
- DID must be active
- Credential must be valid
- Issuer must be trusted

**Events Emitted:**
- `RoleGranted(did, role, timestamp)`
- `CredentialVerified(did, credentialType, credentialId, timestamp)`

### revokeRole

Revokes a role from a DID.

```solidity
function revokeRole(
    string memory did,
    bytes32 role
) public
```

**Parameters:**
- `did`: The DID to revoke role from
- `role`: The role to revoke

**Requirements:**
- Caller must have admin role or be revoking own role
- DID must have the role

**Events Emitted:**
- `RoleRevoked(did, role, timestamp)`

### hasRole

Checks if a DID has a specific role.

```solidity
function hasRole(
    string memory did,
    bytes32 role
) public view returns (bool)
```

**Parameters:**
- `did`: The DID to check
- `role`: The role to verify

**Returns:**
- `bool`: True if DID has the role

### updateTrustedIssuer

Manages trusted issuers for credential types.

```solidity
function updateTrustedIssuer(
    string memory credentialType,
    address issuer,
    bool trusted
) public
```

**Parameters:**
- `credentialType`: Type of credential
- `issuer`: Issuer address
- `trusted`: Whether to trust or untrust

**Requirements:**
- Caller must have admin role

## Credential Verification

### verifyCredentialForRole

Internal function that verifies credentials match role requirements.

```solidity
function verifyCredentialForRole(
    string memory did,
    bytes32 role,
    bytes32 credentialId
) internal returns (bool)
```

**Verification Steps:**
1. Get required credential type for role
2. Verify credential exists and is valid
3. Check issuer is trusted
4. Confirm credential matches DID

## Usage Examples

### Basic Authentication

```javascript
// Check if user has holder role
const did = "did:ethr:mainnet:0x123...";
const hasHolderRole = await didAuth.authenticate(did, HOLDER_ROLE);

if (hasHolderRole) {
    console.log("User authenticated as holder");
}
```

### Granting Roles

```javascript
// Admin grants issuer role
const recipientDid = "did:ethr:mainnet:0x456...";
const credentialId = "0x789..."; // Issuer credential ID

await didAuth.grantRole(
    recipientDid,
    ISSUER_ROLE,
    credentialId
);
```

### Role Management

```javascript
// Check multiple roles
const roles = [HOLDER_ROLE, ISSUER_ROLE, VERIFIER_ROLE];
const userRoles = [];

for (const role of roles) {
    if (await didAuth.hasRole(did, role)) {
        userRoles.push(role);
    }
}
```

### Managing Trusted Issuers

```javascript
// Add trusted issuer for holder credentials
await didAuth.updateTrustedIssuer(
    "HolderCredential",
    issuerAddress,
    true // trust
);

// Remove trusted issuer
await didAuth.updateTrustedIssuer(
    "HolderCredential",
    issuerAddress,
    false // untrust
);
```

## Security Model

### Role Hierarchy

```
DEFAULT_ADMIN_ROLE
    └── Can grant/revoke any role
    
ADMIN_ROLE
    └── Can manage roles and trusted issuers
    
OPERATOR_ROLE
    └── Can perform system operations
    
ISSUER_ROLE
    └── Can issue and verify credentials
    
VERIFIER_ROLE
    └── Can verify documents
    
HOLDER_ROLE
    └── Can register documents
```

### Credential Requirements

Each role requires a specific credential type:
- `HOLDER_ROLE` → `HolderCredential`
- `ISSUER_ROLE` → `IssuerCredential`
- `VERIFIER_ROLE` → `VerifierCredential`

### Trust Model

1. **Trusted Issuers**: Only trusted issuers can issue valid credentials
2. **Credential Verification**: All role grants require valid credentials
3. **DID Validation**: All operations validate DID status

## Integration Patterns

### With DocuVault

```solidity
// DocuVault checks roles before operations
modifier onlyIssuer() {
    require(
        didAuth.hasRole(didRegistry.getDIDByAddress(msg.sender), ISSUER_ROLE),
        "Not an issuer"
    );
    _;
}
```

### With Frontend

```javascript
// Check user permissions
async function checkPermissions(userAddress) {
    const did = await didRegistry.getDIDByAddress(userAddress);
    
    return {
        isHolder: await didAuth.hasRole(did, HOLDER_ROLE),
        isIssuer: await didAuth.hasRole(did, ISSUER_ROLE),
        isVerifier: await didAuth.hasRole(did, VERIFIER_ROLE),
        isAdmin: await didAuth.hasRole(did, ADMIN_ROLE)
    };
}
```

### Event Monitoring

```javascript
// Monitor authentication attempts
didAuth.on("AuthenticationFailed", (did, role, timestamp) => {
    console.log(`Failed auth: ${did} for role ${role} at ${timestamp}`);
    // Trigger security alerts
});

// Track role changes
didAuth.on("RoleGranted", (did, role, timestamp) => {
    console.log(`Role granted: ${role} to ${did}`);
});
```

## Gas Optimization

### Storage Efficiency

1. **Packed Structs**: Role struct uses minimal storage
2. **Bytes32 Keys**: Uses hashed DIDs for mapping keys
3. **Minimal Storage Writes**: Checks before writes

### Function Optimization

1. **View Functions**: Authentication doesn't modify state
2. **Early Returns**: Fail fast on invalid inputs
3. **Batch Operations**: Consider multicall for multiple operations

## Error Handling

### Custom Errors

1. **DidAuth__Unauthorized**
   - Caller lacks required permissions
   - Solution: Ensure proper role assignment

2. **DidAuth__InvalidDID**
   - DID format is invalid
   - Solution: Validate DID before calling

3. **DidAuth__DeactivatedDID**
   - DID has been deactivated
   - Solution: Check DID status first

4. **DidAuth__InvalidCredential**
   - Credential is invalid or expired
   - Solution: Verify credential validity

5. **DidAuth__InvalidRole**
   - Role doesn't exist
   - Solution: Use defined role constants

6. **DidAuth__CredentialVerificationFailed**
   - Credential verification failed
   - Solution: Check credential and issuer

## Best Practices

### For Administrators

1. **Trusted Issuer Management**
   - Regularly audit trusted issuers
   - Remove compromised issuers immediately
   - Document issuer authorization process

2. **Role Assignment**
   - Verify credentials before granting roles
   - Implement off-chain verification workflow
   - Monitor role usage patterns

### For Developers

1. **Error Handling**
   ```javascript
   try {
       await didAuth.grantRole(did, role, credentialId);
   } catch (error) {
       if (error.message.includes("Unauthorized")) {
           // Handle permission error
       } else if (error.message.includes("InvalidCredential")) {
           // Handle credential error
       }
   }
   ```

2. **Caching**
   - Cache role checks for performance
   - Invalidate cache on role changes
   - Use events for cache updates

### For Users

1. **Credential Management**
   - Keep credentials secure
   - Renew before expiration
   - Report compromised credentials

## Deployment and Configuration

### Deployment Order

1. Deploy DidRegistry first
2. Deploy DidVerifier
3. Deploy DidIssuer
4. Deploy DidAuth with addresses
5. Configure trusted issuers

### Post-Deployment

```javascript
// 1. Set up initial admin
const ownerDid = await didRegistry.getDIDByAddress(owner);

// 2. Configure trusted issuers
await didAuth.updateTrustedIssuer("HolderCredential", issuer1, true);
await didAuth.updateTrustedIssuer("IssuerCredential", issuer2, true);

// 3. Grant initial roles
await didAuth.grantRole(adminDid, ADMIN_ROLE, adminCredentialId);
```

## Future Enhancements

1. **Multi-Signature Roles**: Require multiple admins for critical operations
2. **Time-Bound Roles**: Automatic role expiration
3. **Delegated Authentication**: Allow role delegation
4. **Cross-Chain Roles**: Recognize roles from other chains