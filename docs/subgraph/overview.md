# Subgraph Overview

## What is a Subgraph?

A subgraph is a custom API that indexes blockchain data and makes it queryable via GraphQL. The DocuVault subgraph specifically indexes events from our smart contracts to provide efficient access to:

- Document registrations and verifications
- DID (Decentralized Identifier) operations
- Role-based access control events
- Credential issuance and verification

## Why Use a Subgraph?

### Problems it Solves

1. **Blockchain Query Limitations**: Direct blockchain queries are slow and limited
2. **Historical Data Access**: Difficult to query past events efficiently
3. **Complex Relationships**: Hard to link related data across contracts
4. **Real-time Updates**: Need for instant access to blockchain state changes

### Benefits

- **Fast Queries**: Indexed data enables millisecond response times
- **Rich Queries**: Filter, sort, and paginate results
- **Relationship Traversal**: Navigate between related entities
- **Real-time Subscriptions**: Get updates as events occur

## Core Components

### 1. Smart Contract Events

The subgraph listens to events emitted by:

```solidity
// Example: Document registration event
event DocumentRegistered(
    bytes32 indexed documentId,
    address indexed issuer,
    address indexed holder,
    uint256 timestamp
);
```

### 2. Schema Definition

GraphQL schema defines queryable entities:

```graphql
type Document @entity {
  id: ID!
  documentId: Bytes!
  documentType: DocumentType!
  issuer: Issuer!
  holder: Holder!
  isVerified: Boolean!
  registeredAt: BigInt!
}
```

### 3. Event Mappings

TypeScript handlers process events:

```typescript
export function handleDocumentRegistered(event: DocumentRegistered): void {
  let document = new Document(event.params.documentId.toHexString());
  document.issuer = event.params.issuer.toHexString();
  document.holder = event.params.holder.toHexString();
  document.registeredAt = event.params.timestamp;
  document.save();
}
```

### 4. GraphQL API

Query the indexed data:

```graphql
{
  documents(where: { isVerified: true }) {
    id
    documentType
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

## Data Flow

```
Smart Contract Event → Graph Node → Event Handler → Entity Storage → GraphQL API
```

1. **Smart Contract** emits an event
2. **Graph Node** detects the event
3. **Event Handler** processes the data
4. **Entity** is created/updated in storage
5. **GraphQL API** serves the data

## Use Cases

### For Developers

- Build responsive dApps without blockchain latency
- Create complex queries across multiple contracts
- Implement real-time notifications

### For Users

- Instant document search and filtering
- View complete transaction history
- Track document verification status
- Monitor role assignments

## Next Steps

- [Architecture](./architecture.md) - Deep dive into technical architecture
- [Setup Guide](./setup-guide.md) - Get started with local development
- [Query Examples](./query-examples.md) - Common query patterns