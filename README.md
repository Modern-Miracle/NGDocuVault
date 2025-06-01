# NGDocuVault - Secure Blockchain Document Management for Immigrants & Enterprises

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![NGI Sargasso](https://img.shields.io/badge/NGI-Sargasso-blue.svg)](https://ngisargasso.eu/)
[![EU Funding](https://img.shields.io/badge/EU-Horizon%20Europe-yellow.svg)](https://ec.europa.eu/info/research-and-innovation/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-purple.svg)](https://soliditylang.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Distributed%20Storage-orange.svg)](https://ipfs.io/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue.svg)](https://ethereum.org/)
[![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-blueviolet)](https://turbo.build/)

**NGDocuVault** is a secure, blockchain-enabled document management platform specifically designed for **immigrants, refugees, and enterprise users** navigating complex bureaucratic processes across different jurisdictions. This open-source platform combines IPFS storage, zero-knowledge proofs, AI-powered assistance, and blockchain verification to provide secure, privacy-preserving document management and verification.

> **🇪🇺 EU Funded Project**: NGDocuVault is proudly supported by the [NGI Sargasso](https://ngisargasso.eu/) programme, fostering transatlantic collaboration between the EU, US, and Canada in Next Generation Internet technologies. This project has received funding from the European Union's Horizon Europe research and innovation programme.

> **🏛️ Organizations**: Developed by [Hora e.V.](https://hora-ev.eu) in collaboration with [Modern Miracle](https://modern-miracle.com), focusing on innovative document security solutions for vulnerable populations and enterprises.

> **📋 License**: This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.en.html). This ensures that any modifications or network-based services using this code must also be open source.

## 🌟 **Key Features for Secure Document Management**

- 🛡️ **Privacy-First Design** - Zero-knowledge proofs for document verification without exposing content
- 🔐 **Decentralized Identity Management** - SIWE (Sign-In with Ethereum) authentication with DID support
- 📄 **Secure Document Storage** - IPFS-based distributed storage with client-side encryption
- ⛓️ **Blockchain Verification** - Immutable document registration and audit trails on Ethereum
- 🤖 **Docu Assist AI** - Multilingual AI assistant for legal guidance and document navigation
- 🌍 **Multi-Jurisdictional Compliance** - Support for EU, US, and Canadian identity verification standards
- 👥 **Role-Based Access Control** - Granular permissions for Admins, Issuers, Verifiers, and Document Holders
- 📱 **Mobile-Ready PWA** - Progressive Web App with offline capabilities
- 🏗️ **Enterprise-Grade Architecture** - Scalable monorepo structure with comprehensive testing
- 🔒 **Zero-Content Blockchain Storage** - Only document hashes and metadata stored on-chain

## 🏗️ **System Architecture**

NGDocuVault is built as a comprehensive monorepo using Turborepo, consisting of four integrated components:

### 1. **Frontend (React 19)** - `/apps/web/`
- Modern React application with TypeScript and Vite
- Web3 integration with ethers.js for blockchain interaction
- SIWE (Sign-In with Ethereum) authentication
- Docu Assist AI chat interface for legal guidance
- Real-time document verification status
- Responsive design with Tailwind CSS and Radix UI

### 2. **Backend API (Express.js)** - `/apps/api/`
- RESTful API with TypeScript
- IPFS integration (Helia + Web3.Storage/Pinata) for distributed storage
- JWT authentication with SIWE validation
- SQL Server database for off-chain metadata
- Azure Key Vault integration for production security
- Comprehensive middleware for validation and error handling

### 3. **Smart Contracts (Solidity)** - `/apps/contract/`
- Ethereum-compatible blockchain system for document verification
- DID (Decentralized Identity) management contracts
- Role-based access control (Admins, Issuers, Verifiers, Holders)
- Zero-knowledge proof circuits using Circom
- 100% test coverage with comprehensive security testing
- OpenZeppelin security standards implementation

### 4. **Documentation Site (Next.js)** - `/apps/docs/`
- Comprehensive API documentation
- Smart contract interaction guides
- User manuals and developer resources
- Deployment and configuration guides

### 5. **Shared Packages** - `/packages/`
- **`@docu/abi`** - Smart contract ABIs and TypeScript types
- **`@docu/auth`** - Authentication utilities and SIWE integration
- **`@docu/crypto`** - Cryptographic utilities for encryption/decryption
- **`@docu/database`** - Database schemas and migration utilities
- **`@docu/ipfs`** - IPFS integration and file management
- **`@docu/types`** - Shared TypeScript type definitions
- **`@docu/ui`** - Reusable UI components
- **`@docu/utils`** - Common utility functions

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js v18+** and **pnpm** package manager
- **Docker** (for local database and services)
- **Git** for cloning the repository
- **SQL Server** (or Docker container)
- **Ethereum wallet** (MetaMask recommended) for testing

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NGDocuVault-eu/ng-docuvault.git
   cd ng-docuvault
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment files:**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/contract/.env.example apps/contract/.env
   ```

4. **Configure environment variables** (see [Configuration](#configuration) section)

5. **Start all services:**
   ```bash
   # Quick start (recommended)
   ./start.sh
   
   # Or use the simple runner
   ./run-app.sh
   ```

6. **Access the application:**
   - **Frontend**: http://localhost:5173
   - **API**: http://localhost:3001
   - **Blockchain**: http://localhost:8545
   - **Database**: http://localhost:1433

### **Demo**

For demonstration purposes, a hosted version is available at: https://white-forest-05952a903.6.azurestaticapps.net/auth/siwe

**Live Demo Features:**
- 🔐 **SIWE Authentication** - Connect your Ethereum wallet to sign in
- 📄 **Document Upload** - Try uploading and encrypting documents
- ⛓️ **Blockchain Verification** - See real-time document registration
- 🤖 **Docu Assist** - Interact with the AI legal guidance assistant
- 🌍 **Multi-Language Support** - Test the internationalization features

### **Alternative Setup Methods**

#### **Manual Step-by-Step Setup**
```bash
# 1. Start local blockchain
cd apps/contract && pnpm dev

# 2. Deploy smart contracts (in new terminal)
cd apps/contract && pnpm deploy:localhost

# 3. Start database
cd apps/api && pnpm db:prepare

# 4. Start API server
cd apps/api && pnpm dev

# 5. Start web application
cd apps/web && pnpm dev
```

#### **Development with Live Monitoring**
```bash
# See real-time logs from all services
pnpm dev
```

#### **Component-Specific Startup**
```bash
# Start only web frontend
pnpm dev:web

# Start only API backend
pnpm dev:api

# Start only blockchain node
pnpm dev:contract

# Run all tests
pnpm test
```

## 📜 **Available Scripts**

### **Global Scripts**
```bash
# Development
pnpm dev              # Start all applications in development mode
pnpm build            # Build all applications for production
pnpm test             # Run all tests across the monorepo
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier
pnpm clean            # Clean all build artifacts

# Individual applications
pnpm dev:web          # Start React frontend only
pnpm dev:api          # Start Express API only
pnpm dev:contract     # Start Hardhat blockchain node only
pnpm dev:docs         # Start documentation site only
```

### **Smart Contract Operations**
```bash
cd apps/contract

# Development
pnpm compile          # Compile Solidity contracts
pnpm test             # Run contract tests (100% coverage)
pnpm deploy:localhost # Deploy to local Hardhat network
pnpm deploy:sepolia   # Deploy to Sepolia testnet
pnpm deploy:mainnet   # Deploy to Ethereum mainnet

# Verification and utilities
pnpm verify           # Verify contracts on Etherscan
pnpm size             # Check contract sizes
pnpm gas-report       # Generate gas usage report
```

### **Database Operations**
```bash
cd apps/api

# Database management
pnpm db:prepare       # Set up local database with Docker
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm db:reset         # Reset database to clean state
```

## 🏗️ **Architecture Deep Dive**

### **System Flow**
```
1. User Authentication → SIWE (Sign-In with Ethereum)
                              ↓
2. Document Upload → Client-Side Encryption → IPFS Storage
                              ↓
3. Document Registration → Smart Contract → Blockchain
                              ↓
4. Verification Request → Zero-Knowledge Proof → Verification Result
                              ↓
5. Audit Trail → Immutable Blockchain Logs → Compliance Records
```

### **Data Storage Architecture**

#### **Development Mode (default)**
- **Documents**: IPFS via local Helia node
- **Metadata**: Local SQL Server (Docker)
- **Blockchain**: Local Hardhat node
- **Access**: All services run locally with hot-reloading

#### **Production Mode**
- **Documents**: IPFS via Web3.Storage or Pinata
- **Metadata**: Azure SQL Database or PostgreSQL
- **Blockchain**: Ethereum mainnet or Polygon
- **Authentication**: Azure Key Vault for secrets management

### **Security Layers**
1. **Client-Side Encryption** - Documents encrypted before leaving the browser
2. **IPFS Distributed Storage** - No single point of failure
3. **Blockchain Verification** - Immutable proof of document authenticity
4. **Zero-Knowledge Proofs** - Verify documents without exposing content
5. **Role-Based Access Control** - Granular permissions system
6. **Multi-Signature Wallets** - Enterprise-grade transaction security

## 🔧 **Configuration**

### **Environment Variables**

#### **Core Configuration**
```bash
# Database (Required)
DATABASE_URL="Server=localhost,1433;Database=ngdocuvault;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true"

# Blockchain (Required)
LOCAL_RPC_URL="http://localhost:8545"
PRIVATE_KEY="0x..." # Deployer private key
LELINK_CONTRACT_ADDRESS="0x..." # Auto-populated after deployment

# IPFS Storage (Choose one)
WEB3_STORAGE_TOKEN="your-web3-storage-token"
# OR
PINATA_JWT="your-pinata-jwt-token"

# Security (Required)
JWT_SECRET="your-secure-jwt-secret"
SESSION_SECRET="your-secure-session-secret"
```

#### **Production Configuration**
```bash
# Azure (Production)
AZURE_CLIENT_ID="your-azure-client-id"
AZURE_TENANT_ID="your-azure-tenant-id"
AZURE_CLIENT_SECRET="your-azure-client-secret"
AZURE_KEY_VAULT_URL="https://your-vault.vault.azure.net/"

# Production Database
DATABASE_URL="Server=your-prod-server;Database=ngdocuvault;..."

# Production Blockchain
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/your-key"
POLYGON_RPC_URL="https://polygon-mainnet.infura.io/v3/your-key"
```

### **Service Configuration**

#### **API Server (`apps/api/.env`)**
```bash
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Web Application (`apps/web/.env`)**
```bash
VITE_API_BASE_URL="http://localhost:3001"
VITE_CHAIN_ID=31337
VITE_ENABLE_DEVTOOLS=true
```

## 📊 **Monitoring & Observability**

### **Development Monitoring**
```bash
# View real-time logs
pnpm dev  # Shows colored output from all services

# Individual service logs
cd apps/api && pnpm dev     # API logs
cd apps/web && pnpm dev     # Vite dev server logs
cd apps/contract && pnpm dev # Hardhat node logs
```

### **What to Look For**

#### **Successful Document Upload**
```
📄 === DOCUMENT UPLOAD ===
🔐 Client-side encryption: ✅
📦 IPFS upload: ✅ QmHash...
⛓️ Blockchain registration: ✅ Tx: 0x...
```

#### **Successful Verification**
```
🔍 === DOCUMENT VERIFICATION ===
📋 Document request: example.pdf
🧮 Zero-knowledge proof: ✅
✅ Verification result: VALID
```

#### **Blockchain Operations**
```
⛓️ === BLOCKCHAIN ACTIVITY ===
📍 Network: localhost (31337)
📄 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Document registered successfully!
```

## 🧪 **Testing**

### **Comprehensive Test Suite**
```bash
# Run all tests
pnpm test

# Individual test suites
cd apps/web && pnpm test        # Frontend unit tests
cd apps/api && pnpm test        # API integration tests
cd apps/contract && pnpm test   # Smart contract tests

# Test with coverage
cd apps/contract && pnpm test:coverage  # 100% contract coverage
```

### **Testing Categories**

#### **Smart Contract Tests**
- **Unit Tests**: Individual contract functions
- **Integration Tests**: Multi-contract interactions
- **Security Tests**: Common vulnerabilities and edge cases
- **Gas Optimization**: Efficient transaction costs
- **Role-Based Access**: Permission system verification

#### **API Tests**
- **Endpoint Tests**: All REST API routes
- **Authentication Tests**: SIWE and JWT validation
- **IPFS Integration**: File upload and retrieval
- **Database Operations**: CRUD operations and migrations

#### **Frontend Tests**
- **Component Tests**: React component rendering
- **Web3 Integration**: Wallet connection and transactions
- **User Flows**: Complete document management workflows
- **Accessibility Tests**: WCAG compliance verification

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Services Won't Start**
```bash
# Check port availability
lsof -i :5173  # Vite dev server
lsof -i :3001  # API server
lsof -i :8545  # Hardhat node
lsof -i :1433  # SQL Server

# Kill processes if needed
pkill -f "vite"
pkill -f "hardhat node"
pkill -f "node.*api"
```

#### **Database Connection Issues**
```bash
# Start SQL Server container
cd apps/api && pnpm db:prepare

# Check database connectivity
docker ps | grep sqlserver
docker logs ngdocuvault-sqlserver
```

#### **Blockchain Connection Problems**
```bash
# Verify Hardhat node is running
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545

# Check contract deployment
cd apps/contract && pnpm verify-deployment
```

#### **IPFS Upload Failures**
```bash
# Check Web3.Storage token
echo $WEB3_STORAGE_TOKEN

# Test IPFS connectivity
cd apps/api && node -e "console.log('Testing IPFS...')"
```

#### **Web3 Wallet Issues**
- Ensure MetaMask is installed and connected
- Check that you're on the correct network (localhost:8545 for development)
- Verify you have test ETH in your wallet
- Clear browser cache and reconnect wallet

## 📚 **Additional Documentation**

### **Developer Resources**
- [API Documentation](apps/docs/api/) - Complete REST API reference
- [Smart Contract Documentation](apps/docs/contract/) - Contract architecture and deployment
- [Frontend Documentation](apps/docs/web/) - Component architecture and user flows
- [Deployment Guide](apps/docs/deployment/) - Production deployment instructions
- [Security Guide](SECURITY.md) - Security best practices and vulnerability reporting

### **User Guides**
- [Document Upload Guide](apps/docs/guides/document-upload.md) - Step-by-step upload process
- [Verification Guide](apps/docs/guides/verification.md) - How to verify documents
- [Role Management Guide](apps/docs/guides/roles.md) - Understanding user roles and permissions
- [Troubleshooting Guide](apps/docs/guides/troubleshooting.md) - Common issues and solutions

## 🤝 **Contributing**

We welcome contributions from developers, security researchers, and domain experts! Please see our comprehensive guides:

- [Contributing Guidelines](CONTRIBUTING.md) - Development workflow and standards
- [Code of Conduct](.github/CODE_OF_CONDUCT.md) - Community standards and expectations
- [Security Policy](SECURITY.md) - Security vulnerability reporting

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `pnpm test` and `pnpm lint`
5. Submit a pull request

### **Areas for Contribution**
- 🔒 **Security Auditing** - Smart contract and application security
- 🌍 **Internationalization** - Multi-language support for Docu Assist
- ♿ **Accessibility** - WCAG compliance improvements
- 📱 **Mobile Experience** - PWA enhancements
- 🔧 **DevOps** - CI/CD and deployment automation

## 📄 **License**

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### **What this means:**
- ✅ **Free to use** - Use this software for any purpose
- ✅ **Free to modify** - Change the code to fit your needs
- ✅ **Free to distribute** - Share your improvements with others
- ⚠️ **Copyleft requirement** - Any modifications must also be open source
- ⚠️ **Network copyleft** - If you run this as a web service, you must provide the source code

### **Why AGPL v3?**
We chose AGPL v3 to ensure that improvements to document security technology remain open and accessible to everyone, especially in network-deployed scenarios like document management SaaS platforms.

**See the [LICENSE](LICENSE) file for the complete license text.**

### **Commercial Licensing**
For proprietary or commercial use that cannot comply with AGPL v3 terms, please contact:
- **Hora e.V.**: [info@hora-ev.eu](mailto:info@hora-ev.eu)
- **Modern Miracle**: [hello@modern-miracle.com](mailto:hello@modern-miracle.com)

## 🏛️ **Organizations**

### [Hora e.V.](https://hora-ev.eu)
Hora e.V. is a German non-profit organization dedicated to developing innovative solutions for social challenges, with a particular focus on supporting vulnerable populations through technology and community engagement.

### [Modern Miracle](https://modern-miracle.com)
Modern Miracle specializes in cutting-edge document security and blockchain technology solutions, bringing together expertise in cryptography, distributed systems, and enterprise software development.

## 🇪🇺 **EU Funding & Acknowledgments**

This project has received funding from the European Union's Horizon Europe research and innovation programme under the [NGI Sargasso](https://ngisargasso.eu/) initiative. NGI Sargasso fosters transatlantic collaboration between the EU, US, and Canada in Next Generation Internet technologies, supporting innovation in:

- 🔒 **Decentralized Technologies** - Blockchain solutions for document integrity and verification
- 🛡️ **Trust & Data Sovereignty** - Privacy-preserving document management systems
- 🌐 **Internet Innovation** - Next-generation identity and document verification
- 🤝 **Transatlantic Collaboration** - EU-US-Canada technology partnerships for digital identity standards

### **Impact Goals**
- **Empower Immigrants** - Secure, portable digital identity across jurisdictions
- **Enhance Privacy** - Zero-knowledge document verification
- **Ensure Compliance** - Multi-jurisdictional legal standard support
- **Foster Innovation** - Open-source foundation for future identity solutions

## 📞 **Support & Community**

### **Getting Help**
- **Documentation**: [Complete documentation](apps/docs/)
- **GitHub Issues**: [Bug reports and feature requests](https://github.com/NGDocuVault-eu/ng-docuvault/issues)
- **GitHub Discussions**: [Community questions and ideas](https://github.com/NGDocuVault-eu/ng-docuvault/discussions)
- **Email Support**: [contact@hora-ev.eu](mailto:contact@hora-ev.eu)


---

**NGDocuVault** - Empowering immigrants, refugees, and enterprises with secure, sovereign digital identity and document management. 🌍🔒📄
