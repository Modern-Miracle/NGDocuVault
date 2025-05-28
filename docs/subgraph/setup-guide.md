# Subgraph Setup Guide

## Prerequisites

Before setting up the subgraph, ensure you have:

- Node.js v18+ installed
- pnpm package manager
- Docker and Docker Compose
- Running Hardhat node with deployed contracts

## Quick Setup

The fastest way to get started:

```bash
# 1. Start Hardhat node (Terminal 1)
cd apps/contract
pnpm dev:contract

# 2. Deploy contracts (Terminal 2)
cd apps/contract
pnpm deploy

# 3. Deploy subgraph (Terminal 3)
cd packages/subgraph
pnpm install
pnpm deploy:hardhat
```

## Detailed Setup Steps

### Step 1: Prepare the Environment

#### Install Dependencies

```bash
cd packages/subgraph
pnpm install
```

#### Verify Docker Installation

```bash
docker --version
docker compose version
```

### Step 2: Start the Hardhat Node

The subgraph needs a running blockchain to index:

```bash
cd apps/contract
pnpm dev:contract
```

This starts a local Hardhat node on `http://localhost:8545`.

### Step 3: Deploy Smart Contracts

Deploy the contracts that the subgraph will index:

```bash
cd apps/contract
pnpm deploy
```

This deploys:
- DocuVault
- DIDRegistry
- DIDAuth
- DIDIssuer
- DIDVerifier

### Step 4: Configure the Subgraph

The subgraph configuration is in `subgraph.yaml`. Contract addresses are automatically synced from Hardhat deployments.

#### Manual Address Update (if needed)

```bash
cd packages/subgraph
pnpm sync-addresses
```

This updates contract addresses in `subgraph.yaml` to match your deployment.

### Step 5: Deploy the Subgraph

#### Option 1: Automated Deployment (Recommended)

```bash
pnpm deploy:hardhat
```

This single command:
1. Syncs contract addresses
2. Starts Docker services (Graph Node, PostgreSQL, IPFS)
3. Generates code and builds the subgraph
4. Creates and deploys the subgraph

#### Option 2: Manual Deployment

```bash
# Start Docker services
pnpm start-local

# Generate types from GraphQL schema
pnpm codegen

# Build the subgraph
pnpm build

# Create subgraph on Graph Node
pnpm create-local

# Deploy the subgraph
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 --version-label v0.0.1 docuvault
```

### Step 6: Verify Deployment

#### Test Queries

```bash
pnpm test:simple
```

#### Access Points

- **GraphQL Endpoint**: http://localhost:8000/subgraphs/name/docuvault
- **GraphQL Playground**: http://localhost:8000/subgraphs/name/docuvault/graphql
- **Graph Node Admin**: http://localhost:8020/

#### Sample Query

```graphql
{
  _meta {
    block {
      number
    }
    hasIndexingErrors
  }
  documents(first: 10) {
    id
    documentType
    isVerified
  }
}
```

## Docker Services

### Services Overview

```yaml
services:
  graph-node:     # Core indexing service
  postgres:       # Data storage
  ipfs:          # File storage
```

### Port Mappings

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Graph Node | 8000 | 8000 | GraphQL HTTP |
| Graph Node | 8001 | 8001 | GraphQL WebSocket |
| Graph Node | 8020 | 8020 | Admin API |
| Graph Node | 8030 | 8030 | Index Status |
| Graph Node | 8040 | 8040 | Metrics |
| PostgreSQL | 5432 | 5434 | Database |
| IPFS | 5001 | 5001 | IPFS API |

### Managing Services

```bash
# Start services
pnpm start-local

# Stop services
pnpm stop-local

# View logs
pnpm logs

# Check service status
docker compose ps
```

## Development Workflow

### 1. Making Schema Changes

Edit `schema.graphql`:

```graphql
type NewEntity @entity {
  id: ID!
  someField: String!
  timestamp: BigInt!
}
```

### 2. Update Event Handlers

Edit mapping files in `src/`:

```typescript
export function handleNewEvent(event: NewEvent): void {
  let entity = new NewEntity(event.params.id.toHexString());
  entity.someField = event.params.someField;
  entity.timestamp = event.block.timestamp;
  entity.save();
}
```

### 3. Rebuild and Redeploy

```bash
# Generate new types
pnpm codegen

# Build the subgraph
pnpm build

# Remove old deployment
pnpm remove-local

# Deploy updated subgraph
pnpm deploy-local
```

## Environment Configuration

### Network Configuration

The subgraph connects to Hardhat via Docker:

```yaml
ethereum: 'hardhat:http://host.docker.internal:8545'
```

### Start Block Configuration

Set in `subgraph.yaml` for each data source:

```yaml
source:
  startBlock: 1  # Start from genesis block
```

### Performance Tuning

Environment variables in `docker-compose.yml`:

```yaml
ETHEREUM_POLLING_INTERVAL: 1000  # Poll every second
GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE: 10  # Blocks per query
```

## Troubleshooting Setup Issues

### Port Conflicts

If ports are already in use:

```bash
# Check what's using a port
lsof -i :8000

# Change port in docker-compose.yml
ports:
  - '8001:8000'  # Use 8001 instead
```

### Docker Issues

```bash
# Reset Docker services
docker compose down -v
docker compose up -d

# Check container logs
docker compose logs graph-node -f
```

### Contract Address Mismatch

```bash
# Manually sync addresses
pnpm sync-addresses

# Verify addresses
cat subgraph.yaml | grep address
```

## Next Steps

- [Query Examples](./query-examples.md) - Learn to query the subgraph
- [Development Guide](./development-guide.md) - Advanced development topics
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions