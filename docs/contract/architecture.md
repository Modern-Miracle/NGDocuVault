# Smart Contract Architecture

## System Architecture Overview

The Docu smart contract system implements a layered architecture designed for scalability, security, and modularity.

```
┌─────────────────────────────────────────────────────────────┐
│                    External Applications                      │
│                 (DApps, APIs, Indexers)                      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Contract Layer                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Access Control │  Core Business   │   Verification          │
│  ┌───────────┐  │  ┌────────────┐  │  ┌─────────────────┐   │
│  │  DidAuth  │  │  │ DocuVault  │  │  │  DidVerifier    │   │
│  └───────────┘  │  └────────────┘  │  └─────────────────┘   │
│                 │  ┌────────────┐  │  ┌─────────────────┐   │
│                 │  │DidRegistry │  │  │  ZKP Verifiers  │   │
│                 │  └────────────┘  │  └─────────────────┘   │
│                 │  ┌────────────┐  │                         │
│                 │  │ DidIssuer  │  │                         │
│                 │  └────────────┘  │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                              │
│              (Mappings, Structs, Events)                      │
└─────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Access Control Pattern

The system uses OpenZeppelin's AccessControl for role-based permissions:

```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
bytes32 public constant HOLDER_ROLE = keccak256("HOLDER_ROLE");
bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
```

**Benefits:**
- Granular permission management
- Role hierarchy support
- Dynamic role assignment
- Gas-efficient permission checks

### 2. Registry Pattern

Used in DidRegistry for managing DIDs:

```solidity
mapping(bytes32 => DIDDocument) internal didData;
mapping(address => bytes32) internal addressToDidHash;
mapping(string => bytes32) internal didToHash;
```

**Benefits:**
- O(1) lookup complexity
- Efficient storage usage
- Support for multiple access patterns

### 3. Factory Pattern

VerifierFactory creates new verifier instances:

```solidity
function deployVerifier(string memory verifierType) 
    external 
    returns (address)
```

**Benefits:**
- Consistent verifier deployment
- Reduced deployment costs
- Centralized management

### 4. Pausable Pattern

Emergency stop mechanism across contracts:

```solidity
contract DocuVault is Pausable {
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
}
```

**Benefits:**
- Emergency response capability
- Protects user funds
- Controlled recovery

## Data Models

### Document Model

```solidity
struct DocumentInfo {
    string cid;              // IPFS content identifier
    bytes32 contentHash;     // Document hash
    address holder;          // Document owner
    uint40 registeredAt;     // Registration timestamp
    uint40 verifiedAt;       // Verification timestamp
    DocumentType docType;    // Document category
    bool isVerified;         // Verification status
}
```

### DID Document Model

```solidity
struct DIDDocument {
    address subject;         // Controller address
    uint40 lastUpdated;      // Update timestamp
    bool active;             // Active status
    string publicKey;        // Public key
    string document;         // DID document
}
```

### Verification Model

```solidity
struct VerificationRequest {
    address requester;       // Who requested
    bytes32 documentHash;    // Document to verify
    uint256 timestamp;       // Request time
    bool completed;          // Completion status
    bytes32 resultHash;      // Verification result
}
```

## Storage Optimization

### 1. Struct Packing

Efficient memory layout to minimize storage slots:

```solidity
struct OptimizedDocument {
    address holder;          // 20 bytes
    uint40 registeredAt;     // 5 bytes
    uint40 verifiedAt;       // 5 bytes
    bool isVerified;         // 1 byte
    uint8 docType;          // 1 byte
    // Total: 32 bytes = 1 storage slot
}
```

### 2. Mapping Strategies

Using bytes32 keys for gas efficiency:

```solidity
// Instead of string keys
mapping(string => Document) documents;

// Use hashed keys
mapping(bytes32 => Document) documents;
bytes32 key = keccak256(abi.encodePacked(identifier));
```

### 3. Event-Driven Storage

Minimize on-chain storage by using events:

```solidity
event DocumentRegistered(
    bytes32 indexed docHash,
    address indexed holder,
    string cid,
    uint256 timestamp
);
```

## Contract Interactions

### 1. Registration Flow

```
User → DocuVault.registerDocument()
         ├── Validate inputs
         ├── Check holder role
         ├── Store document info
         └── Emit DocumentRegistered

DocuVault → DidRegistry.getDID()
         └── Verify holder identity
```

### 2. Verification Flow

```
Issuer → DocuVault.verifyDocument()
          ├── Check issuer role
          ├── Validate document exists
          ├── Update verification status
          └── Emit DocumentVerified

DocuVault → DidAuth.hasRole()
          └── Validate permissions
```

### 3. ZKP Verification Flow

```
User → ZKPVerifier.verifyProof()
        ├── Validate proof format
        ├── Execute circuit verification
        ├── Store result
        └── Return verification status

ZKPVerifier → DocuVault.updateVerification()
        └── Record ZKP result
```

## Security Architecture

### 1. Multi-Layer Security

```
Application Layer
    ├── Input validation
    ├── Access control checks
    └── Business logic validation

Contract Layer
    ├── Reentrancy guards
    ├── Integer overflow protection
    └── State consistency checks

Storage Layer
    ├── Access restrictions
    └── Data integrity checks
```

### 2. Permission Hierarchy

```
DEFAULT_ADMIN_ROLE
    │
    ├── ADMIN_ROLE
    │   ├── Grant/revoke roles
    │   ├── Pause/unpause system
    │   └── System configuration
    │
    ├── ISSUER_ROLE
    │   ├── Verify documents
    │   └── Issue credentials
    │
    ├── HOLDER_ROLE
    │   ├── Register documents
    │   └── Manage access
    │
    └── VERIFIER_ROLE
        ├── Request verifications
        └── Access results
```

### 3. Error Handling

Custom errors for gas efficiency and clarity:

```solidity
error DocuVault__NotAuthorized();
error DocuVault__InvalidHash();
error DocuVault__DocumentNotFound();
```

## Upgrade Strategy

### 1. Immutable Core

Core contracts are designed to be immutable with:
- No proxy patterns in critical paths
- Clear migration interfaces
- Event-based state recovery

### 2. Modular Extensions

New functionality via:
- Additional verifier contracts
- External registry contracts
- Plugin interfaces

### 3. Data Migration

Support for migration through:
- Batch export functions
- State snapshot events
- Cross-contract references

## Gas Optimization Strategies

### 1. Storage Access

- Minimize SSTORE operations
- Use memory for temporary data
- Batch updates when possible

### 2. Function Optimization

```solidity
// Optimized: Single SLOAD
function getDocument(bytes32 hash) 
    external 
    view 
    returns (DocumentInfo memory doc) 
{
    doc = documents[hash];
    require(doc.holder != address(0), "Not found");
}
```

### 3. Event Usage

Replace storage with events where possible:
- Audit trails
- Historical data
- Indexable information

## Integration Patterns

### 1. Oracle Integration

```solidity
interface IOracle {
    function requestData(bytes32 requestId) external;
    function fulfillData(bytes32 requestId, bytes calldata data) external;
}
```

### 2. Cross-Contract Calls

```solidity
interface IDidRegistry {
    function getDID(address user) external view returns (string memory);
    function isActive(string memory did) external view returns (bool);
}
```

### 3. Callback Patterns

```solidity
interface IVerificationCallback {
    function onVerificationComplete(
        bytes32 docHash,
        bool result
    ) external;
}
```

## Deployment Architecture

### 1. Contract Dependencies

```
1. Deploy DidAuth (no dependencies)
2. Deploy DidRegistry (requires DidAuth)
3. Deploy DidIssuer (requires DidAuth, DidRegistry)
4. Deploy DidVerifier (requires DidAuth)
5. Deploy ZKP Verifiers (standalone)
6. Deploy DocuVault (requires all above)
```

### 2. Configuration Flow

```
Post-Deployment:
1. Configure roles in DidAuth
2. Register initial admin
3. Set contract addresses in DocuVault
4. Configure verifier registry
5. Set system parameters
```

### 3. Network Considerations

- Gas price strategies
- Block confirmation requirements
- Network-specific optimizations

## Monitoring and Maintenance

### 1. Event Monitoring

Key events to monitor:
- Role changes
- Document registrations
- Verification completions
- System pauses

### 2. Health Checks

- Contract balance monitoring
- Gas usage tracking
- Permission integrity
- State consistency

### 3. Maintenance Operations

- Role management
- Parameter updates
- Emergency responses
- System upgrades