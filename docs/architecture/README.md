# Architecture Documentation

Technical architecture and design decisions for the Docu platform.

## 📑 Table of Contents

- [System Overview](./overview.md)
- [Technical Stack](./tech-stack.md)
- [Data Flow](./data-flow.md)
- [Security Architecture](./security.md)
- [Scalability](./scalability.md)
- [Integration Patterns](./integrations.md)
- [Decision Records](./adr/README.md)

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │────▶│    API Server   │────▶│  SQL Database   │
│   (React/Vite)  │     │  (Express/Node) │     │   (SQL Server)  │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Smart Contracts│     │   IPFS Network  │
│   (Ethereum)    │     │ (Web3.Storage)  │
└─────────────────┘     └─────────────────┘
```

### Component Architecture

1. **Frontend Layer**
   - React SPA with Vite
   - Web3 wallet integration
   - Real-time blockchain events
   - Responsive UI with Radix/Tailwind

2. **Backend Layer**
   - Express.js REST API
   - SIWE authentication
   - Session management
   - IPFS gateway

3. **Blockchain Layer**
   - Solidity smart contracts
   - Role-based access control
   - Document verification
   - DID management

4. **Storage Layer**
   - SQL Server for sessions/metadata
   - IPFS for document storage
   - Blockchain for verification proofs

## 🔐 Security Architecture

- **Authentication**: SIWE (Sign-In with Ethereum)
- **Authorization**: Role-based (Admin, Issuer, Verifier, Holder)
- **Data Privacy**: ZKP for sensitive verification
- **Document Security**: IPFS + blockchain hashes

## 🔄 Data Flow

1. **Document Upload**
   - User uploads to IPFS via API
   - CID stored on blockchain
   - Metadata in SQL database

2. **Verification Flow**
   - Retrieve CID from blockchain
   - Fetch document from IPFS
   - Verify hash on-chain

3. **Access Control**
   - Check user roles via DidAuth
   - Validate permissions
   - Grant/deny access

## 🚀 Scalability Considerations

- Stateless API design
- IPFS for distributed storage
- Event-driven architecture
- Caching strategies
- Load balancing ready

## 🔌 Integration Points

- **Ethereum**: Via ethers.js/viem
- **IPFS**: Web3.Storage API
- **Database**: TypeORM/raw SQL
- **Events**: Blockchain event monitoring

See [Technical Stack](./tech-stack.md) for detailed technology choices.