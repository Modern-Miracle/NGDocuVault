# Subgraph Troubleshooting Guide

This guide helps diagnose and fix common issues with the DocuVault subgraph.

## Common Issues

### 1. Subgraph Not Indexing

**Symptoms:**
- No data returned from queries
- Block number not advancing
- `hasIndexingErrors: true` in metadata

**Solutions:**

Check Graph Node connection to Ethereum:
```bash
# Check logs
docker compose logs graph-node -f | grep "ERROR"

# Verify Ethereum connection
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Restart services:
```bash
cd packages/subgraph
docker compose restart graph-node
```

### 2. Port Already in Use

**Error:**
```
Bind for 0.0.0.0:5433 failed: port is already allocated
```

**Solutions:**

Check what's using the port:
```bash
# Check port usage
lsof -i :5433
docker ps --filter "publish=5433"

# Stop conflicting container
docker stop <container-id>

# Or change port in docker-compose.yml
ports:
  - '5435:5432'  # Use different port
```

### 3. Contract Address Mismatch

**Symptoms:**
- No events being indexed
- "No data source found" errors

**Solutions:**

Sync addresses from deployment:
```bash
cd packages/subgraph
pnpm sync-addresses

# Verify addresses match
cat subgraph.yaml | grep "address:"
cat ../../apps/contract/deployments/localhost/*.json | grep "address"
```

### 4. WASM Compilation Errors

**Error:**
```
ERROR: AS100: Not implemented: Closures
```

**Solutions:**

Check AssemblyScript syntax:
```typescript
// Bad: Arrow functions not supported
let result = array.map(x => x.toString());

// Good: Use regular functions
let result = array.map<string>((x): string => {
  return x.toString();
});
```

### 5. Entity Not Found Errors

**Error:**
```
Entity of type Document with id 0x123... not found
```

**Solutions:**

Always check entity existence:
```typescript
// Bad
let document = Document.load(id) as Document;
document.field = value; // Throws if null

// Good
let document = Document.load(id);
if (!document) {
  document = new Document(id);
}
document.field = value;
```

### 6. Docker Connection Issues

**Error:**
```
Cannot connect to host.docker.internal:8545
```

**Solutions:**

For Linux users:
```yaml
# Add to docker-compose.yml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

For network issues:
```bash
# Use Docker's bridge network IP
ip addr show docker0
# Update ethereum URL in docker-compose.yml
ethereum: 'hardhat:http://172.17.0.1:8545'
```

### 7. Indexing Errors

**Checking for errors:**
```graphql
{
  _meta {
    hasIndexingErrors
  }
}
```

**Finding error details:**
```bash
# Check Graph Node logs
docker compose logs graph-node -f | grep "ERROR"

# Look for specific handler errors
docker compose logs graph-node -f | grep "handleDocumentRegistered"
```

**Common causes:**
- Null pointer access
- Integer overflow
- Failed contract calls

### 8. Slow Query Performance

**Symptoms:**
- Queries taking > 1 second
- Timeout errors

**Solutions:**

Optimize queries:
```graphql
# Bad: Fetching all fields
{
  documents {
    # All 20+ fields
  }
}

# Good: Select only needed fields
{
  documents(first: 100) {
    id
    documentType
    isVerified
  }
}
```

Add indexes to schema:
```graphql
type Document @entity {
  holderAddress: Bytes! @index
  registeredAt: BigInt! @index
}
```

### 9. Memory Issues

**Error:**
```
FATAL: out of memory
```

**Solutions:**

Increase Graph Node memory:
```yaml
# docker-compose.yml
services:
  graph-node:
    environment:
      GRAPH_NODE_HEAP_SIZE: 4096
    deploy:
      resources:
        limits:
          memory: 4G
```

### 10. IPFS Connection Failed

**Error:**
```
Failed to connect to IPFS at ipfs:5001
```

**Solutions:**

Check IPFS status:
```bash
# Check if IPFS is running
docker compose ps ipfs

# Test IPFS API
curl http://localhost:5001/api/v0/id

# Restart IPFS
docker compose restart ipfs
```

## Debugging Techniques

### 1. Enable Verbose Logging

```yaml
# docker-compose.yml
environment:
  GRAPH_LOG: debug
  GRAPH_LOG_QUERY: true
```

### 2. Test Individual Handlers

Create minimal test cases:
```typescript
// Test specific event
export function testDocumentRegistered(): void {
  let event = createMockEvent();
  handleDocumentRegistered(event);
  
  assert.fieldEquals(
    'Document',
    '0x123',
    'isVerified',
    'false'
  );
}
```

### 3. Query Debugging

Use GraphQL variables:
```graphql
query DebugDocument($id: ID!) {
  document(id: $id) {
    id
    __typename
    _DEBUG_: _meta {
      block {
        number
      }
    }
  }
}
```

### 4. Block-by-Block Debugging

Find problematic block:
```bash
# Binary search for error block
graph deploy --start-block 1000 --end-block 2000
```

## Performance Troubleshooting

### Check Indexing Speed

```bash
# Monitor blocks per second
watch -n 1 'curl -s http://localhost:8030/graphql -X POST -H "Content-Type: application/json" -d "{\"query\": \"{ indexingStatusForCurrentVersion(subgraphName: \\\"docuvault\\\") { chains { latestBlock { number } } } }\"}" | jq'
```

### Database Performance

```sql
-- Connect to PostgreSQL
docker exec -it docuvault-graph-postgres psql -U graph-node

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'subgraphs'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Recovery Procedures

### 1. Complete Reset

```bash
# Stop services
docker compose down -v

# Clear data
rm -rf data/

# Restart
pnpm deploy:hardhat
```

### 2. Reindex from Specific Block

```bash
# Remove current deployment
pnpm remove-local

# Deploy from specific block
graph deploy --start-block 12345 docuvault
```

### 3. Database Recovery

```bash
# Backup before recovery
docker exec docuvault-graph-postgres pg_dump -U graph-node graph-node > backup.sql

# Restore from backup
docker exec -i docuvault-graph-postgres psql -U graph-node graph-node < backup.sql
```

## Monitoring Setup

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Check services
echo "Checking services..."
docker compose ps

# Check indexing status
echo -e "\nChecking indexing status..."
curl -s http://localhost:8030/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ indexingStatuses { synced health chains { latestBlock { number } } } }"}' | jq

# Check for errors
echo -e "\nChecking for errors..."
curl -s http://localhost:8000/subgraphs/name/docuvault \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { hasIndexingErrors } }"}' | jq
```

### Automated Monitoring

```yaml
# docker-compose.yml addition
services:
  healthcheck:
    image: willfarrell/autoheal
    environment:
      - AUTOHEAL_CONTAINER_LABEL=all
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: always
```

## Getting Help

### Collect Diagnostic Information

```bash
# Create diagnostic report
echo "=== Docker Status ===" > diagnostic.txt
docker compose ps >> diagnostic.txt
echo -e "\n=== Recent Logs ===" >> diagnostic.txt
docker compose logs --tail=100 >> diagnostic.txt
echo -e "\n=== Subgraph Config ===" >> diagnostic.txt
cat subgraph.yaml >> diagnostic.txt
```

### Resources

- [The Graph Documentation](https://thegraph.com/docs)
- [AssemblyScript Documentation](https://www.assemblyscript.org)
- [Graph Protocol Discord](https://discord.gg/graphprotocol)

### Common Log Patterns

```bash
# Find mapping errors
docker compose logs graph-node | grep -E "thread.*panicked|ERROR|WARN"

# Find specific handler issues
docker compose logs graph-node | grep -A 5 -B 5 "handleDocumentRegistered"

# Monitor real-time
docker compose logs -f graph-node | grep --line-buffered "ERROR"
```