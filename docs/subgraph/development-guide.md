# Subgraph Development Guide

This guide covers advanced topics for developing and maintaining the DocuVault subgraph.

## Development Environment Setup

### Required Tools

```bash
# Install Graph CLI globally
npm install -g @graphprotocol/graph-cli

# Verify installation
graph --version
```

### Project Structure

```
packages/subgraph/
├── schema.graphql          # GraphQL schema definition
├── subgraph.yaml          # Subgraph manifest
├── src/
│   ├── mapping.ts         # DocuVault event handlers
│   └── did-mapping.ts     # DID contract event handlers
├── generated/             # Auto-generated types
├── build/                 # Compiled output
├── scripts/              # Deployment and utility scripts
└── docker-compose.yml    # Local Graph Node setup
```

## Schema Development

### Entity Design Principles

1. **Use Immutable IDs**: Prefer bytes32 or transaction hashes
2. **Normalize Relationships**: Avoid data duplication
3. **Index Queryable Fields**: Add indexes for filter fields

### Schema Best Practices

```graphql
type Document @entity {
  # Use bytes32 hash as ID for immutability
  id: ID!
  
  # Core fields
  documentId: Bytes! @index
  documentType: DocumentType!
  
  # Relationships
  issuer: Issuer!
  holder: Holder!
  
  # Denormalized for query performance
  issuerAddress: Bytes! @index
  holderAddress: Bytes! @index
  
  # Timestamps as BigInt
  registeredAt: BigInt! @index
  verifiedAt: BigInt
  
  # Status flags
  isVerified: Boolean! @index
  isExpired: Boolean!
}

# Use enums for type safety
enum DocumentType {
  GENERIC
  BIRTH_CERTIFICATE
  DEATH_CERTIFICATE
  MARRIAGE_CERTIFICATE
  ID_CARD
  PASSPORT
  OTHER
}
```

### Adding New Entities

1. Define the entity in `schema.graphql`
2. Run `pnpm codegen` to generate types
3. Import and use in mappings

## Event Handler Development

### Handler Structure

```typescript
import { Document, Holder, Issuer } from '../generated/schema';
import { DocumentRegistered } from '../generated/DocuVault/DocuVault';
import { BigInt, Address, log } from '@graphprotocol/graph-ts';

export function handleDocumentRegistered(event: DocumentRegistered): void {
  // 1. Generate deterministic ID
  let documentId = event.params.documentId.toHexString();
  
  // 2. Load or create entities
  let document = Document.load(documentId);
  if (!document) {
    document = new Document(documentId);
  }
  
  // 3. Set entity fields
  document.documentId = event.params.documentId;
  document.registeredAt = event.params.timestamp;
  
  // 4. Handle relationships
  let issuer = getOrCreateIssuer(event.params.issuer);
  let holder = getOrCreateHolder(event.params.holder);
  
  document.issuer = issuer.id;
  document.holder = holder.id;
  
  // 5. Save entity
  document.save();
  
  // 6. Log for debugging
  log.info('Document registered: {}', [documentId]);
}
```

### Helper Functions

```typescript
function getOrCreateIssuer(address: Address): Issuer {
  let issuerId = address.toHexString();
  let issuer = Issuer.load(issuerId);
  
  if (!issuer) {
    issuer = new Issuer(issuerId);
    issuer.address = address;
    issuer.isActive = true;
    issuer.registeredAt = BigInt.fromI32(0);
    issuer.save();
  }
  
  return issuer;
}
```

### Contract Calls

```typescript
// Bind contract for calling view functions
let docuVault = DocuVault.bind(event.address);

// Use try_ pattern for safe calls
let docInfo = docuVault.try_getDocumentInfo(documentId);

if (!docInfo.reverted) {
  document.isVerified = docInfo.value.getIsVerified();
  document.expirationDate = docInfo.value.getExpirationDate();
} else {
  log.warning('Failed to fetch document info: {}', [documentId]);
  // Set defaults
  document.isVerified = false;
  document.expirationDate = BigInt.fromI32(0);
}
```

## Testing Strategies

### Unit Testing Handlers

Create test fixtures:

```typescript
// tests/document-utils.ts
import { newMockEvent } from 'matchstick-as';
import { DocumentRegistered } from '../generated/DocuVault/DocuVault';

export function createDocumentRegisteredEvent(
  documentId: string,
  issuer: string,
  holder: string
): DocumentRegistered {
  let event = changetype<DocumentRegistered>(newMockEvent());
  
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam('documentId', ethereum.Value.fromBytes(Bytes.fromHexString(documentId)))
  );
  // ... add other parameters
  
  return event;
}
```

### Integration Testing

Test with local node:

```bash
# Deploy contracts and create test data
cd apps/contract
pnpm test:integration

# Run subgraph tests
cd packages/subgraph
pnpm test:simple
```

## Debugging

### Enable Debug Logging

```typescript
import { log } from '@graphprotocol/graph-ts';

export function handleEvent(event: SomeEvent): void {
  log.debug('Processing event: {}', [event.transaction.hash.toHexString()]);
  
  // Use different log levels
  log.info('Info message', []);
  log.warning('Warning message', []);
  log.error('Error message', []);
}
```

### View Logs

```bash
# Follow Graph Node logs
pnpm logs

# Filter for specific handler
docker compose logs graph-node -f | grep "handleDocumentRegistered"
```

### Common Issues

1. **Entity Not Found**
   ```typescript
   // Always check if entity exists
   let entity = Entity.load(id);
   if (!entity) {
     entity = new Entity(id);
   }
   ```

2. **Type Conversion**
   ```typescript
   // Convert between types carefully
   let timestamp = BigInt.fromI32(event.block.timestamp.toI32());
   let address = Address.fromString('0x...');
   ```

3. **Array Handling**
   ```typescript
   // Initialize arrays
   entity.documentIds = entity.documentIds || [];
   entity.documentIds.push(documentId);
   ```

## Performance Optimization

### 1. Minimize Contract Calls

```typescript
// Bad: Multiple calls
let doc1 = contract.getDocument(id1);
let doc2 = contract.getDocument(id2);

// Good: Batch in one transaction or cache results
let documents = contract.getDocuments([id1, id2]);
```

### 2. Use Derived Fields

```graphql
type Holder @entity {
  id: ID!
  address: Bytes!
  documents: [Document!]! @derivedFrom(field: "holder")
  documentCount: Int! # Denormalized counter
}
```

### 3. Optimize Entity Loading

```typescript
// Cache entities within handler
let cache = new Map<string, Entity>();

function getCachedEntity(id: string): Entity | null {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  let entity = Entity.load(id);
  if (entity) {
    cache.set(id, entity);
  }
  return entity;
}
```

## Deployment Best Practices

### Version Management

```bash
# Use semantic versioning
graph deploy --version-label v1.2.3 docuvault

# Tag releases
git tag -a v1.2.3 -m "Add share request filtering"
git push origin v1.2.3
```

### Migration Strategy

1. **Non-Breaking Changes**: Direct deployment
2. **Breaking Changes**: 
   - Deploy new version alongside old
   - Migrate clients gradually
   - Deprecate old version

### Monitoring

```graphql
# Health check query
{
  _meta {
    block {
      number
      hash
    }
    deployment
    hasIndexingErrors
  }
}
```

## Advanced Features

### Custom Data Sources

```yaml
templates:
  - kind: ethereum/contract
    name: DynamicContract
    network: hardhat
    source:
      abi: DynamicContract
    mapping:
      # ... mapping configuration
```

### File Data Sources

```yaml
- kind: file/ipfs
  name: DocumentMetadata
  network: hardhat
  source:
    kind: file/ipfs
  mapping:
    apiVersion: 0.0.7
    language: wasm/assemblyscript
    file: ./src/ipfs-mapping.ts
    handler: handleMetadata
```

### Call Handlers

```yaml
callHandlers:
  - function: registerDocument(bytes32,address,uint256)
    handler: handleRegisterCall
```

## Security Considerations

### Input Validation

```typescript
export function handleEvent(event: SomeEvent): void {
  // Validate addresses
  if (event.params.address.equals(Address.zero())) {
    log.warning('Invalid zero address', []);
    return;
  }
  
  // Validate data ranges
  if (event.params.timestamp.gt(BigInt.fromI32(2000000000))) {
    log.warning('Future timestamp detected', []);
    return;
  }
}
```

### Access Control

The subgraph is read-only, but consider:
- Rate limiting at API gateway
- Query complexity limits
- Monitoring for abuse

## Maintenance

### Regular Tasks

1. **Monitor Performance**
   ```bash
   curl http://localhost:8040/metrics
   ```

2. **Check Sync Status**
   ```bash
   curl http://localhost:8030/graphql \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"query": "{ indexingStatuses { synced health } }"}'
   ```

3. **Database Maintenance**
   ```bash
   # Backup PostgreSQL
   docker exec docuvault-graph-postgres pg_dump -U graph-node graph-node > backup.sql
   ```

### Troubleshooting Failed Indexes

1. Check logs for errors
2. Identify problematic block
3. Fix handler code
4. Redeploy from block before error

```bash
# Redeploy from specific block
graph deploy --version-label v1.0.1 --start-block 12345 docuvault
```