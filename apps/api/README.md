# NGDocuVault API

The NGDocuVault API is the backend service for the decentralized document management platform, providing secure authentication, IPFS storage integration, and blockchain interaction capabilities.

## 🏗️ Architecture Overview

The API is built with Express.js and TypeScript, following a service-oriented architecture with clear separation of concerns:

```
📁 src/
├── 🔧 config/           # Configuration files (CORS, session, blockchain)
├── 🎯 controllers/      # HTTP request handlers
├── 🛠️ helpers/          # Utility classes (error handlers, event parsers)
├── 📚 lib/             # Core business logic
├── 🔐 middleware/      # Express middleware (auth, validation, error handling)
├── 📊 models/          # Data models and schemas
├── 🛣️ routes/          # API route definitions
├── 🔍 schemas/         # Input validation schemas
├── 🏢 services/        # Service layer (database, contracts, crypto, IPFS)
├── 🔧 types/           # TypeScript type definitions
├── 🛠️ utils/           # Utility functions
└── ✅ validators/      # Input validation logic
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- SQL Server (via Docker)
- IPFS node or Web3.Storage/Pinata credentials

### Environment Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # Database
   DATABASE_URL="Server=localhost,1433;Database=ngdocuvault;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true"

   # JWT Security
   JWT_SECRET="your-super-secure-jwt-secret"
   SESSION_SECRET="your-super-secure-session-secret"

   # Blockchain
   LOCAL_RPC_URL="http://localhost:8545"
   PRIVATE_KEY="your-private-key-for-contract-interaction"

   # IPFS Storage
   WEB3_STORAGE_TOKEN="your-web3-storage-token"
   PINATA_JWT="your-pinata-jwt-token"

   # Azure Key Vault (Production)
   AZURE_CLIENT_ID="your-azure-client-id"
   AZURE_TENANT_ID="your-azure-tenant-id"
   AZURE_CLIENT_SECRET="your-azure-client-secret"
   ```

### Development Commands

```bash
# Install dependencies
pnpm install

# Start database
pnpm db:start

# Setup database
pnpm db:setup

# Start development server
pnpm dev:api

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Lint code
pnpm lint
pnpm lint:fix
```

## 🔗 API Endpoints

### Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Authentication Endpoints

#### SIWE (Sign-In with Ethereum) Authentication
```
POST   /auth/siwe/challenge        # Generate SIWE challenge
POST   /auth/siwe/verify           # Verify SIWE signature
POST   /auth/siwe/logout           # Logout user
GET    /auth/siwe/status           # Check auth status
```

#### JWT Authentication
```
POST   /auth/jwt/login             # Traditional login
POST   /auth/jwt/refresh           # Refresh access token
POST   /auth/jwt/logout            # Logout user
```

#### Protected Routes
```
GET    /auth/protected/profile     # Get user profile
PUT    /auth/protected/profile     # Update user profile
GET    /auth/protected/verify      # Verify authentication
```

### IPFS Endpoints
```
POST   /ipfs/upload               # Upload file to IPFS
GET    /ipfs/retrieve/:cid        # Retrieve file from IPFS
POST   /ipfs/pin                  # Pin file to IPFS
DELETE /ipfs/unpin/:cid           # Unpin file from IPFS
GET    /ipfs/status/:cid          # Check pin status
```

### Health Check
```
GET    /health                    # API health status
```

## 🏢 Service Architecture

### Authentication Services
- **`SiweAuthChallenge`**: Manages SIWE challenge generation and verification
- **`AuthService`**: Handles authentication flows and session management
- **`DidResolverService`**: Resolves DIDs and manages DID documents
- **`JWTService`**: JWT token generation and validation

### Contract Services
- **`DidAuthService`**: Interacts with DID authentication contract
- **`DidRegistryService`**: Manages DID registration and updates
- **`DidIssuerService`**: Handles credential issuance
- **`DidVerifierService`**: Manages credential verification
- **`DocuVaultService`**: Document registration and management

### Crypto Services
- **`SymmetricCryptoService`**: Symmetric encryption/decryption
- **`AsymmetricEncService`**: Asymmetric encryption operations
- **`HashingService`**: Hashing utilities (SHA-256, Keccak-256)

### Database Services
- **`AuthDatabaseService`**: Authentication data management
- **`AccessDatabaseService`**: Access control and permissions
- **`TokenDatabaseService`**: Token storage and management
- **`DatabaseService`**: Base database operations

### IPFS Services
- **`IPFSService`**: Core IPFS operations
- **`Web3UpService`**: Web3.Storage integration
- **`PinataService`**: Pinata integration

### Key Vault Services
- **`KeyVaultService`**: Azure Key Vault integration for secure key management

## 🔐 Security Features

### Authentication & Authorization
- **SIWE Integration**: Ethereum wallet-based authentication
- **JWT Tokens**: Secure session management with refresh tokens
- **Role-Based Access Control**: Admin, Issuer, Verifier, Holder roles
- **Session Management**: Secure session handling with cookies

### Data Protection
- **Encryption**: Client-side encryption before IPFS storage
- **Hashing**: Secure document hashing for verification
- **Key Management**: Azure Key Vault integration for production
- **Rate Limiting**: Request rate limiting for API protection

### Security Headers & Middleware
- **Helmet**: Security headers for HTTP responses
- **CORS**: Controlled cross-origin resource sharing
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Secure error responses without sensitive data exposure

## 🧪 Testing

### Test Structure
```
📁 __tests__/
├── 🔧 config/          # Test configuration and setup
├── 🎯 controllers/     # Controller unit tests
├── 🔗 integration/     # Integration tests
├── 🎭 mock/           # Mock services and data
└── 🏢 services/       # Service unit tests
```

### Testing Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test auth.controller.test.ts
```

### Test Coverage Targets
- **Controllers**: 80%+
- **Services**: 90%+
- **Utilities**: 85%+
- **Critical Paths**: 95%+

## 🗄️ Database Schema

### Tables
- **`AuthChallenges`**: SIWE authentication challenges
- **`RefreshTokens`**: JWT refresh token storage
- **`AccessGrants`**: Document access permissions
- **`IpfsLookups`**: IPFS CID to document ID mappings

### Database Commands
```bash
# Start SQL Server container
pnpm db:start

# Stop database
pnpm db:stop

# Initialize database schema
pnpm db:setup

# Clear database
pnpm db:clear

# Full database preparation
pnpm db:prepare

# Rebuild database
pnpm db:rebuild
```

## 📡 Blockchain Integration

### Smart Contract Interaction
- **Contract Services**: Dedicated services for each contract type
- **Event Parsing**: Automated parsing of blockchain events
- **Error Handling**: Comprehensive contract error handling
- **Gas Optimization**: Efficient contract interaction patterns

### Supported Networks
- **Local Development**: Hardhat node (chainId: 31337)
- **Testnet**: Sepolia (chainId: 11155111)
- **Mainnet**: Ethereum mainnet (chainId: 1)

## 🌐 IPFS Integration

### Storage Providers
- **Web3.Storage**: Primary storage provider
- **Pinata**: Secondary storage provider
- **Local IPFS**: Development and testing

### File Operations
- **Upload**: Encrypted file upload to IPFS
- **Retrieval**: Secure file retrieval with access control
- **Pinning**: Persistent storage management
- **Metadata**: File metadata and CID management

## 🔧 Configuration

### Environment Variables

#### Required
```bash
DATABASE_URL=           # SQL Server connection string
JWT_SECRET=             # JWT signing secret
SESSION_SECRET=         # Session signing secret
LOCAL_RPC_URL=          # Blockchain RPC URL
```

#### Optional
```bash
WEB3_STORAGE_TOKEN=     # Web3.Storage API token
PINATA_JWT=             # Pinata JWT token
AZURE_CLIENT_ID=        # Azure service principal
AZURE_TENANT_ID=        # Azure tenant ID
AZURE_CLIENT_SECRET=    # Azure client secret
NODE_ENV=               # Environment (development/production)
PORT=                   # Server port (default: 5000)
```

### Configuration Files
- **`cors.config.ts`**: CORS settings and allowed origins
- **`session.config.ts`**: Session management configuration
- **`blockchain.config.ts`**: Blockchain network settings
- **`keyVault.config.ts`**: Azure Key Vault configuration

## 🚀 Deployment

### Production Checklist
- [ ] Set all required environment variables
- [ ] Configure Azure Key Vault
- [ ] Set up SQL Server database
- [ ] Configure IPFS storage provider
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure backup strategy

### Docker Deployment
```bash
# Build Docker image
docker build -t ngdocuvault-api .

# Run with Docker Compose
docker-compose up -d
```

## 📊 Monitoring & Logging

### Logging
- **Winston**: Structured logging with multiple transports
- **Morgan**: HTTP request logging
- **Log Levels**: Error, warn, info, debug
- **Log Files**: `combined.log`, `error.log`, `exceptions.log`

### Health Monitoring
- **Health Check Endpoint**: `/api/v1/health`
- **Database Connection**: Automatic health checks
- **IPFS Connectivity**: Storage provider status
- **Blockchain Connectivity**: RPC endpoint monitoring

## 🐛 Error Handling

### Error Types
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Auth failures and unauthorized access
- **Contract Errors**: Smart contract interaction errors
- **IPFS Errors**: Storage provider errors
- **Database Errors**: SQL Server connection and query errors

### Error Response Format
```json
{
  "error": {
    "type": "ValidationError",
    "message": "Invalid input data",
    "code": "INVALID_INPUT",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

## 🔄 API Versioning

### Current Version: v1
- **Base Path**: `/api/v1`
- **Backward Compatibility**: Maintained for major versions
- **Deprecation Policy**: 6-month notice for breaking changes

## 📚 Additional Resources

- **[Smart Contract Documentation](../contract/README.md)**
- **[Frontend Documentation](../web/README.md)**
- **[Deployment Guide](../../docs/deployment/)**
- **[API Reference](../../docs/api/)**

## 🤝 Contributing

Please see the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

---

**NGDocuVault API** - Secure, decentralized document management for immigrant identity verification.