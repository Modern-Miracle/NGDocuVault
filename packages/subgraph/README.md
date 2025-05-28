# DocuVault Subgraph

This subgraph indexes events from the DocuVault smart contracts to provide a queryable GraphQL API for document management, DID operations, and verification data.

## Overview

The subgraph tracks:
- Document registration, verification, and sharing
- DID (Decentralized Identifier) management
- Issuer and verifier operations
- Role-based access control
- Credential issuance and verification

## Prerequisites

- Node.js v18+
- pnpm
- Docker and Docker Compose
- Running Hardhat node with deployed contracts

## Quick Start

### 1. Start Hardhat Node and Deploy Contracts

```bash
# Terminal 1: Start Hardhat node
cd apps/contract
pnpm dev:contract

# Terminal 2: Deploy contracts
cd apps/contract
pnpm deploy
```

### 2. Deploy Subgraph

```bash
cd packages/subgraph

# Install dependencies
pnpm install

# Deploy subgraph with single command
pnpm deploy:hardhat
```

This command will:
1. Sync contract addresses from Hardhat deployment
2. Start Docker services (IPFS, PostgreSQL, Graph Node)
3. Generate code and build the subgraph
4. Create and deploy the subgraph

### 3. Query the Subgraph

Once deployed, you can query the subgraph at:
- GraphQL Endpoint: `http://localhost:8000/subgraphs/name/docuvault`
- GraphQL Playground: Open the endpoint in your browser

## Available Commands

```bash
# Docker services management
pnpm start-local      # Start Graph Node, IPFS, and PostgreSQL
pnpm stop-local       # Stop all Docker services
pnpm logs            # View Graph Node logs

# Development
pnpm codegen         # Generate AssemblyScript types
pnpm build           # Build the subgraph
pnpm sync-addresses  # Sync contract addresses from Hardhat

# Deployment
pnpm deploy:hardhat  # Full deployment for Hardhat (recommended)
pnpm create-local    # Create subgraph on local Graph Node
pnpm deploy-local    # Deploy built subgraph
pnpm remove-local    # Remove deployed subgraph

# Testing
pnpm test:simple     # Run simple test queries
```

## Architecture

### Data Sources

The subgraph indexes events from the following contracts:

1. **DocuVault**: Main document management contract
   - Document registration, verification, sharing
   - Consent management
   - Issuer management

2. **DIDRegistry**: Decentralized identifier registry
   - DID registration, updates, deactivation

3. **DIDVerifier**: Credential verification
   - Trusted issuer management
   - Verification status updates

4. **DIDIssuer**: Credential issuance
   - Credential creation
   - Subject-credential relationships

5. **DIDAuth**: Authentication and authorization
   - Role management (grant/revoke)
   - Authentication events
   - Credential verification

### Entities

Key entities tracked by the subgraph:

- **Document**: Registered documents with metadata
- **Holder**: Document holders/owners
- **Issuer**: Document issuers with activation status
- **DID**: Decentralized identifiers
- **Credential**: Issued credentials
- **Role**: Role assignments for DIDs
- **ShareRequest**: Document sharing requests
- **VerificationRequest**: Document verification requests

## Example Queries

### Get Recent Documents
```graphql
{
  documents(first: 10, orderBy: registeredAt, orderDirection: desc) {
    id
    documentType
    isVerified
    holder {
      address
    }
    issuer {
      address
      isActive
    }
  }
}
```

### Get Active DIDs
```graphql
{
  dids(where: { active: true }) {
    id
    did
    controller
    roles {
      role
      granted
    }
  }
}
```

### Get Document Share Requests
```graphql
{
  shareRequests(where: { status: "PENDING" }) {
    id
    document {
      documentType
    }
    requester
    holder {
      address
    }
    requestedAt
  }
}
```

## Troubleshooting

### Common Issues

1. **Graph Node not starting**: Ensure Docker is running and ports 8000, 8020, 5001, 5433 are available

2. **Contract addresses mismatch**: Run `pnpm sync-addresses` to update addresses from Hardhat deployment

3. **Subgraph deployment fails**: Check logs with `pnpm logs` and ensure all services are healthy

4. **Empty query results**: Ensure transactions have been mined on the Hardhat node

### Useful Commands for Debugging

```bash
# Check Docker services status
docker compose ps

# View detailed Graph Node logs
docker compose logs graph-node -f --tail 100

# Check if subgraph is indexed
curl http://localhost:8030/graphql -X POST -H "Content-Type: application/json" -d '{"query": "{ indexingStatuses { subgraph synced health } }"}'
```

## Development

### Adding New Event Handlers

1. Update `schema.graphql` with new entities
2. Add event handlers in `src/mapping.ts` or `src/did-mapping.ts`
3. Update `subgraph.yaml` with new event configurations
4. Run `pnpm codegen` to generate types
5. Build and redeploy

### Testing Changes

1. Make changes to mappings or schema
2. Run `pnpm build` to compile
3. Run `pnpm remove-local` to remove old deployment
4. Run `pnpm deploy-local` to deploy changes
5. Test with `pnpm test:simple`

## Production Deployment

For production deployment to The Graph's hosted service or decentralized network, see `scripts/prepare-production.sh`.