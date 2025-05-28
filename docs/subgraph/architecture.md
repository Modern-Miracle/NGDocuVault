# Subgraph Architecture

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Hardhat Node  │────▶│   Graph Node    │────▶│   PostgreSQL    │
│   (Ethereum)    │     │  (Event Index)  │     │   (Storage)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌─────────────────┐                │
         │              │      IPFS       │                │
         │              │  (File Storage) │                │
         │              └─────────────────┘                │
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   GraphQL API   │
                        │ localhost:8000  │
                        └─────────────────┘
```

## Components

### 1. Graph Node

The Graph Node is the core indexing service that:

- Connects to Ethereum nodes
- Watches for specific events
- Processes events through mappings
- Stores entities in PostgreSQL
- Serves GraphQL queries

**Configuration:**
```yaml
ethereum: 'hardhat:http://host.docker.internal:8545'
ETHEREUM_POLLING_INTERVAL: 1000
GRAPH_ETHEREUM_GENESIS_BLOCK_NUMBER: '1'
```

### 2. PostgreSQL Database

Stores indexed data with:

- **Entities**: Structured data from events
- **Metadata**: Block numbers, hashes, sync status
- **Relationships**: Foreign key constraints

**Schema Example:**
```sql
-- Simplified representation
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    document_id BYTEA NOT NULL,
    document_type TEXT NOT NULL,
    issuer_id TEXT REFERENCES issuers(id),
    holder_id TEXT REFERENCES holders(id),
    is_verified BOOLEAN DEFAULT FALSE,
    registered_at NUMERIC NOT NULL
);
```

### 3. IPFS

InterPlanetary File System for:

- Storing subgraph deployment files
- Hosting WASM mappings
- Distributing schema definitions

### 4. Event Processing Pipeline

```
Event Detection → Filtering → Handler Execution → Entity Updates → Database Commit
```

#### Event Detection
- Graph Node polls Ethereum node
- Filters events by contract address
- Matches event signatures

#### Handler Execution
- Loads WASM mapping code
- Executes handler function
- Creates/updates entities

#### Database Updates
- Validates entity changes
- Updates PostgreSQL
- Maintains data integrity

## Data Sources Configuration

### DocuVault Contract

```yaml
- kind: ethereum
  name: DocuVault
  network: hardhat
  source:
    address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
    abi: DocuVault
    startBlock: 1
  mapping:
    kind: ethereum/events
    apiVersion: 0.0.7
    language: wasm/assemblyscript
    entities:
      - Document
      - Holder
      - Issuer
      - ShareRequest
      - VerificationRequest
    eventHandlers:
      - event: DocumentRegistered(indexed bytes32,indexed address,indexed address,uint256)
        handler: handleDocumentRegistered
      - event: DocumentVerified(indexed bytes32,address,uint256)
        handler: handleDocumentVerified
```

### DID Contracts

Similar configurations for:
- **DIDRegistry**: DID registration and updates
- **DIDAuth**: Role management and authentication
- **DIDIssuer**: Credential issuance
- **DIDVerifier**: Trust management

## Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Holder    │──────▶│  Document   │◀──────│   Issuer    │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│     DID     │       │ShareRequest │       │  Credential │
└─────────────┘       └─────────────┘       └─────────────┘
```

### Key Relationships

1. **Document → Holder**: One-to-One
2. **Document → Issuer**: One-to-One
3. **Holder → Documents**: One-to-Many
4. **DID → Roles**: One-to-Many
5. **Document → ShareRequests**: One-to-Many

## Event Handler Architecture

### Handler Structure

```typescript
export function handleDocumentRegistered(event: DocumentRegistered): void {
  // 1. Extract event parameters
  let documentId = event.params.documentId;
  let issuerAddress = event.params.issuer;
  let holderAddress = event.params.holder;
  
  // 2. Create or load entities
  let issuer = getOrCreateIssuer(issuerAddress);
  let holder = getOrCreateHolder(holderAddress);
  
  // 3. Create new document entity
  let document = new Document(documentId.toHexString());
  
  // 4. Fetch additional data from contract
  let docuVault = DocuVault.bind(event.address);
  let docInfo = docuVault.try_getDocumentInfo(documentId);
  
  // 5. Set entity properties
  document.issuer = issuer.id;
  document.holder = holder.id;
  document.registeredAt = event.params.timestamp;
  
  // 6. Save entity
  document.save();
}
```

### Error Handling

- **Contract Call Failures**: Use `try_` methods
- **Invalid Data**: Validate before saving
- **Missing Relationships**: Create placeholder entities

## Performance Optimizations

### 1. Batch Processing
- Groups multiple events per block
- Reduces database transactions

### 2. Entity Caching
- In-memory cache during block processing
- Minimizes database reads

### 3. Indexed Fields
- GraphQL schema indices for common queries
- Database indices on foreign keys

### 4. Start Block Configuration
- Set appropriate `startBlock` values
- Skip historical blocks when unnecessary

## Monitoring and Debugging

### Health Checks

```graphql
{
  _meta {
    block {
      number
      hash
    }
    hasIndexingErrors
  }
}
```

### Indexing Status

```bash
curl http://localhost:8030/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ indexingStatuses { subgraph synced health } }"}'
```

### Common Issues

1. **Indexing Errors**: Check mapping logs
2. **Sync Issues**: Verify Ethereum connection
3. **Query Performance**: Analyze entity relationships

## Security Considerations

### Data Integrity
- Events are immutable once indexed
- Reorgs handled automatically
- Data validated before storage

### Access Control
- Read-only GraphQL API
- No direct database access
- Rate limiting recommended

### Best Practices
- Validate event data
- Handle missing entities gracefully
- Use deterministic entity IDs