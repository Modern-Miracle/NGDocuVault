# NGDocuVault Smart Contracts

The NGDocuVault Smart Contracts provide the on-chain infrastructure for decentralized document management, DID (Decentralized Identifier) registry, and privacy-preserving verification using zero-knowledge proofs. Built with Solidity and optimized for gas efficiency and security.

## 🏗️ Contract Architecture

```
📁 Smart Contract System
├── 🏛️ Core Contracts
│   ├── 📄 DocuVault.sol          # Main document management
│   ├── 🆔 DidRegistry.sol        # DID registration and management
│   ├── 🔐 DidAuth.sol            # Authentication and authorization
│   ├── 📋 DidIssuer.sol          # Credential issuance tracking
│   └── ✅ DidVerifier.sol        # Credential verification
├── 🛡️ ZKP Verifiers
│   ├── 📅 AgeVerifier.sol        # Age verification circuits
│   ├── 🏥 FhirVerifier.sol       # Healthcare data verification
│   └── #️⃣ HashVerifier.sol       # Generic hash verification
├── 🔧 Utilities
│   ├── 🏭 VerifierFactory.sol    # Verifier contract factory
│   ├── 🧪 MockIssuer.sol        # Testing utilities
│   └── 🔌 IZKPVerifier.sol      # ZKP interface
└── ⚙️ Circuits
    ├── 📐 AgeVerifier.circom     # Age proof circuits
    ├── 🔬 FhirVerifier.circom    # FHIR proof circuits
    └── 🧮 HashVerifier.circom    # Hash proof circuits
```

## 🎯 Core Features

### Document Management (DocuVault)
- **📄 Document Registration**: Secure on-chain document metadata storage
- **🔒 Access Control**: Granular permissions for document sharing
- **✅ Verification Status**: Issuer-based document verification
- **⏰ Expiration Management**: Time-based document validity
- **🤝 Consent Management**: User-controlled document sharing

### DID System
- **🆔 DID Registry**: Complete DID lifecycle management
- **🔐 Authentication**: Role-based access control (RBAC)
- **📋 Credential Issuance**: On-chain credential registry
- **✅ Verification**: Trusted issuer verification
- **🔄 DID Resolution**: Efficient DID document retrieval

### Zero-Knowledge Proofs
- **🛡️ Privacy-Preserving**: Verify claims without revealing data
- **📅 Age Verification**: Prove age ranges without revealing exact age
- **🏥 Healthcare Verification**: FHIR-compliant medical data proofs
- **#️⃣ Hash Verification**: Generic data integrity proofs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Hardhat development environment
- Circom (for ZK circuits)
- pnpm package manager

### Environment Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # Local Development
   LOCAL_RPC_URL="http://localhost:8545"
   PRIVATE_KEY="your-deployer-private-key"
   
   # Testnet Deployment
   SEPOLIA_URL="https://sepolia.infura.io/v3/your-infura-key"
   TESTNET_PRIVATE_KEY="your-testnet-private-key"
   
   # Mainnet Deployment
   MAINNET_URL="https://mainnet.infura.io/v3/your-infura-key"
   MAINNET_PRIVATE_KEY="your-mainnet-private-key"
   
   # Verification
   ETHERSCAN_API_KEY="your-etherscan-api-key"
   
   # Gas Configuration
   GAS_PRICE_GWEI="30"
   GAS_LIMIT="5000000"
   ```

### Development Commands

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm build

# Start local blockchain
pnpm dev:contract

# Deploy contracts to localhost
pnpm deploy

# Run tests
pnpm test

# Generate coverage report
pnpm coverage

# Lint Solidity code
pnpm lint

# Generate TypeScript types
pnpm typechain
```

## 📜 Core Contracts

### DocuVault.sol
**Main document management contract with comprehensive lifecycle support**

#### Key Features:
- **Document Registration**: Register documents with IPFS CID and metadata
- **Role-Based Access**: Admin, Issuer, Verifier, Holder role management
- **Consent Management**: User-controlled document sharing permissions
- **Verification Workflow**: Multi-step document verification process
- **Expiration Handling**: Time-based document validity management

#### Key Functions:
```solidity
// Document Management
function registerDocument(bytes32 documentId, address holder, uint256 expirationDate, DocumentType documentType, string calldata cid)
function verifyDocument(bytes32 documentId)
function updateDocument(bytes32 oldDocumentId, bytes32 newDocumentId, uint256 expirationDate, DocumentType documentType, string calldata cid)

// Access Control
function grantAccess(bytes32 documentId, address requester, uint256 validUntil)
function revokeAccess(bytes32 documentId, address requester)
function shareDocument(bytes32 documentId, address requester, uint256 validUntil)

// Information Retrieval
function getDocumentInfo(bytes32 documentId) returns (bool isVerified, bool isExpired, address issuer, address holder, uint256 issuanceDate, uint256 expirationDate, DocumentType documentType, string memory cid)
function getHolderDocuments(address holder) returns (bytes32[] memory)
```

#### Gas Costs:
- **Document Registration**: ~100,000 gas
- **Document Verification**: ~50,000 gas
- **Access Grant**: ~80,000 gas

### DidRegistry.sol
**Optimized DID registry with efficient storage patterns**

#### Key Features:
- **DID Registration**: Register DIDs with public keys and documents
- **DID Resolution**: Efficient DID-to-address mapping
- **Document Updates**: Update DID documents and public keys
- **Deactivation**: Safely deactivate DIDs while preserving history

#### Key Functions:
```solidity
// DID Management
function registerDid(string calldata did, string calldata document, string calldata publicKey)
function updateDidDocument(string calldata did, string calldata newDocument)
function updatePublicKey(string calldata did, string calldata newPublicKey)
function deactivateDid(string calldata did)

// DID Resolution
function resolveDid(string calldata did) returns (address subject, string memory publicKey, string memory document, bool active)
function getDidFromAddress(address addr) returns (string memory)
function checkDidActive(string calldata did) returns (bool)
```

#### Gas Costs:
- **DID Registration**: ~150,000 gas
- **DID Update**: ~70,000 gas
- **DID Resolution**: ~10,000 gas

### DidAuth.sol
**Authentication and role-based access control system**

#### Key Features:
- **Role Management**: Admin, Issuer, Verifier, Holder roles
- **Credential-Based Auth**: DID-based authentication
- **Permission Checks**: Granular permission validation
- **Role Assignment**: Dynamic role assignment and revocation

#### Roles:
- **ADMIN_ROLE**: System administration and role management
- **ISSUER_ROLE**: Document issuance and verification
- **VERIFIER_ROLE**: Document verification and validation
- **HOLDER_ROLE**: Document holding and sharing

#### Key Functions:
```solidity
// Role Management
function grantDidRole(string calldata did, bytes32 role)
function revokeDidRole(string calldata did, bytes32 role)
function hasDidRole(string calldata did, bytes32 role) returns (bool)

// Authentication
function authenticateWithCredential(string calldata did, bytes32 credentialHash)
function isValidCredential(string calldata issuerDid, bytes32 credentialHash) returns (bool)
```

### DidIssuer.sol
**Credential issuance and registry management**

#### Key Functions:
```solidity
// Credential Issuance
function issueCredential(string calldata holderDid, bytes32 credentialHash, uint256 expirationDate)
function revokeCredential(string calldata holderDid, bytes32 credentialHash)

// Registry Management
function isCredentialValid(string calldata holderDid, bytes32 credentialHash) returns (bool)
function getCredentialStatus(string calldata holderDid, bytes32 credentialHash) returns (bool isValid, uint256 issuanceDate, uint256 expirationDate)
```

### DidVerifier.sol
**Credential verification and trusted issuer management**

#### Key Functions:
```solidity
// Verification
function verifyCredential(string calldata issuerDid, string calldata holderDid, bytes32 credentialHash) returns (bool)
function addTrustedIssuer(string calldata issuerDid)
function removeTrustedIssuer(string calldata issuerDid)

// Issuer Management
function isTrustedIssuer(string calldata issuerDid) returns (bool)
function getTrustedIssuers() returns (string[] memory)
```

## 🛡️ Zero-Knowledge Proof Verifiers

### AgeVerifier.sol
**Privacy-preserving age verification using ZK-SNARKs**

#### Features:
- **Age Range Proofs**: Prove age within specific ranges
- **Birth Date Verification**: Verify birth dates without revealing exact date
- **Configurable Thresholds**: Flexible age verification criteria

### FhirVerifier.sol
**Healthcare data verification compliant with FHIR standards**

#### Features:
- **Medical Record Verification**: Verify healthcare data integrity
- **Privacy-Preserving**: Verify medical claims without exposing sensitive data
- **FHIR Compliance**: Compatible with healthcare data standards

### HashVerifier.sol
**Generic hash-based verification for any data type**

#### Features:
- **Data Integrity**: Verify data integrity without revealing content
- **Flexible Implementation**: Support for various hash functions
- **Merkle Tree Support**: Efficient verification of large datasets

## 🧪 Testing Framework

### Test Structure
```
📁 test/
├── 📄 DocuVault/         # DocuVault contract tests
├── 🆔 DidAuth/           # Authentication tests
├── ✅ DidVerifier/       # Verification tests
├── #️⃣ HashVerifier/      # ZKP verifier tests
├── 🧪 MockIssuer/       # Mock contract tests
├── 🔧 utils/            # Test utilities
└── 🛡️ zkp/              # ZK proof tests
```

### Testing Commands
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test test/DocuVault/DocuVault.test.ts

# Generate coverage report
pnpm coverage

# Run gas report
pnpm gas-report

# Check contract sizes
pnpm size
```

### Test Coverage Targets
- **Core Contracts**: 95%+ line coverage
- **ZKP Verifiers**: 90%+ line coverage
- **Utilities**: 85%+ line coverage
- **Integration Tests**: All major workflows covered

## 🚀 Deployment

### Local Deployment
```bash
# Start local Hardhat node
pnpm dev:contract

# Deploy all contracts
pnpm deploy

# Set up roles and permissions
pnpm setup:roles

# Verify deployment
pnpm verify:roles
```

### Testnet Deployment
```bash
# Deploy to Sepolia
pnpm deploy:sepolia

# Verify contracts on Etherscan
pnpm verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Production Deployment
```bash
# Run pre-deployment checklist
pnpm deploy:checklist

# Deploy to mainnet
pnpm deploy:mainnet

# Verify deployment
pnpm deploy:verify
```

### Deployment Scripts
- **`deploy.ts`**: Main deployment script for all contracts
- **`deploy-sepolia.ts`**: Testnet-specific deployment
- **`setup-roles.sh`**: Automated role setup
- **`verify-deployment.ts`**: Post-deployment verification

## ⚙️ Configuration

### Network Configuration
- **Hardhat**: Local development (chainId: 31337)
- **Sepolia**: Ethereum testnet (chainId: 11155111)
- **Mainnet**: Ethereum mainnet (chainId: 1)
- **Polygon**: Layer 2 support (chainId: 137)
- **Arbitrum**: Layer 2 support (chainId: 42161)

### Compiler Settings
- **Solidity Version**: 0.8.20
- **Optimizer**: Enabled (200 runs)
- **EVM Version**: Paris
- **Via IR**: Enabled for better gas efficiency

### Gas Optimization
- **Struct Packing**: Efficient storage layout
- **Mapping Optimization**: Reduced storage slots
- **Event Optimization**: Efficient event emissions
- **Circuit Optimization**: Optimized ZK circuits

## 🔒 Security Features

### Access Control
- **OpenZeppelin AccessControl**: Role-based permissions
- **Custom Modifiers**: Contract-specific authorization
- **Multi-signature Support**: Admin operations requiring multiple signatures
- **Emergency Pause**: Circuit breaker for emergency situations

### Input Validation
- **Parameter Validation**: Comprehensive input checking
- **Address Validation**: Zero address and contract checks
- **Data Sanitization**: Prevent malicious input
- **Reentrancy Protection**: Guard against reentrancy attacks

### Upgradability
- **Proxy Pattern**: Upgradeable contract architecture (planned)
- **Version Control**: Contract versioning system
- **Migration Scripts**: Safe upgrade procedures
- **Backward Compatibility**: Maintain API compatibility

## 📊 Gas Optimization Techniques

### Storage Optimization
- **Packed Structs**: Minimize storage slots
- **Mapping Efficiency**: Optimized key-value storage
- **Event-Driven Architecture**: Reduce on-chain storage

### Function Optimization
- **Batch Operations**: Multiple operations in single transaction
- **Early Returns**: Fail fast for invalid conditions
- **Assembly Optimization**: Critical path assembly code

### Circuit Optimization
- **Constraint Reduction**: Minimize circuit constraints
- **Trusted Setup**: Efficient ceremony parameters
- **Proof Size**: Optimized proof generation and verification

## 🔧 Development Tools

### Code Quality
- **Solhint**: Solidity linting and style checking
- **Prettier**: Code formatting
- **Gas Reporter**: Detailed gas usage analysis
- **Contract Sizer**: Contract size monitoring

### Testing Tools
- **Hardhat**: Development framework
- **Chai**: Assertion library
- **Waffle**: Testing utilities
- **Coverage**: Code coverage reporting

### ZK Circuit Tools
- **Circom**: Circuit compiler
- **snarkjs**: Proof generation and verification
- **Ceremony Tools**: Trusted setup utilities

## 📚 Circuit Development

### Circuit Structure
```
📁 circuits/
├── 🔧 AgeVerifier.circom     # Age verification circuit
├── 🏥 FhirVerifier.circom    # FHIR verification circuit
├── #️⃣ HashVerifier.circom    # Hash verification circuit
├── 📁 __test__/             # Circuit tests
└── 📁 scripts/              # Circuit build scripts
```

### Circuit Commands
```bash
# Setup circuits
pnpm setup:circuits

# Compile circuits
pnpm build:circuits

# Generate verifier contracts
pnpm generate:verifiers

# Run circuit tests
pnpm test:circuits
```

## 📖 Integration Examples

### Document Registration Flow
```typescript
// 1. Register document
const tx1 = await docuVault.registerDocument(
  documentId,
  holderAddress,
  expirationDate,
  DocumentType.PASSPORT,
  ipfsCid
);

// 2. Verify document (issuer)
const tx2 = await docuVault.connect(issuer).verifyDocument(documentId);

// 3. Share document (holder)
const tx3 = await docuVault.connect(holder).shareDocument(
  documentId,
  verifierAddress,
  validUntil
);
```

### DID Registration Flow
```typescript
// 1. Register DID
const tx1 = await didRegistry.registerDid(
  "did:example:123456789abcdefghi",
  didDocument,
  publicKey
);

// 2. Assign role
const tx2 = await didAuth.grantDidRole(
  "did:example:123456789abcdefghi",
  ISSUER_ROLE
);

// 3. Authenticate
const isAuthenticated = await didAuth.hasDidRole(
  "did:example:123456789abcdefghi",
  ISSUER_ROLE
);
```

## 🤝 Contributing

Please see the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

### Contract-Specific Guidelines
- Follow Solidity best practices and style guides
- Write comprehensive NatSpec documentation
- Implement thorough test coverage (90%+)
- Optimize for gas efficiency
- Follow security best practices

## 📚 Additional Resources

- **[API Documentation](../api/README.md)**
- **[Frontend Documentation](../web/README.md)**
- **[Contract Documentation](../../docs/contract/)**
- **[ZK Circuit Documentation](../../docs/zkp/)**

## 📝 License

This project is licensed under the MIT License. See contract headers for details.

---

**NGDocuVault Contracts** - Secure, privacy-preserving smart contracts for decentralized identity and document management.