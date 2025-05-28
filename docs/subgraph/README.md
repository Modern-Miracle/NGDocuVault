# Subgraph Documentation

The DocuVault subgraph provides a GraphQL API for querying blockchain data from the DocuVault smart contracts. It indexes events from the Ethereum blockchain and makes the data easily accessible through GraphQL queries.

## Table of Contents

- [Overview](./overview.md)
- [Architecture](./architecture.md)
- [Setup Guide](./setup-guide.md)
- [Query Examples](./query-examples.md)
- [Development Guide](./development-guide.md)
- [Troubleshooting](./troubleshooting.md)

## Quick Start

```bash
# Navigate to subgraph directory
cd packages/subgraph

# Install dependencies
pnpm install

# Deploy subgraph (with Hardhat node running)
pnpm deploy:hardhat
```

## Key Features

- **Real-time Indexing**: Automatically indexes blockchain events as they occur
- **GraphQL API**: Query blockchain data using familiar GraphQL syntax
- **Multiple Contract Support**: Indexes data from DocuVault, DID Registry, and related contracts
- **Relationship Mapping**: Links documents, holders, issuers, and DIDs
- **Historical Data**: Access complete transaction history

## Architecture Overview

The subgraph consists of:

1. **Data Sources**: Smart contracts being indexed
2. **Event Handlers**: TypeScript mappings that process events
3. **GraphQL Schema**: Defines queryable entities
4. **Graph Node**: Indexes and serves the data

## Indexed Contracts

- **DocuVault**: Document management and verification
- **DIDRegistry**: Decentralized identifier registration
- **DIDAuth**: Authentication and role management
- **DIDIssuer**: Credential issuance
- **DIDVerifier**: Credential verification

For detailed information, see the individual documentation pages.