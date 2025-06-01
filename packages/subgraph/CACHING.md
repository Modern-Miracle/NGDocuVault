# Graph Node Caching Guide

This document explains the caching approach for the DocuVault GraphQL API implemented using The Graph Protocol.

## Caching Architecture Overview

Graph Node provides several built-in caching mechanisms:

1. **Query Result Caching** - Caches GraphQL query results for a configurable number of blocks
2. **Block Caching** - Caches blockchain blocks to avoid refetching from providers
3. **`eth_call` Caching** - Caches results of Ethereum calls at specific blocks
4. **Query Plan Caching** - Caches the execution plans for GraphQL queries

Our implementation takes advantage of these caching mechanisms using both local and distributed approaches.

## Configuration Files

### `config.toml`

This is the main configuration file for Graph Node. It includes:

- Database connection settings
- Provider configuration
- Caching configuration (in-memory and Redis)
- Deployment rules
- Node roles

To use this file, start Graph Node with:

```bash
graph-node --config config.toml
```

### `cache-config.yaml`

This file organizes our caching priorities and settings. It includes:

- Global cache settings
- Per-query caching configurations with priority levels
- Entity patterns that benefit from query optimization
- Cache invalidation events for reference

### `apply-cache-config.js`

This script:

1. Reads the `cache-config.yaml` file
2. Generates appropriate Graph Node environment variables
3. Creates a `.env.graph-node` file that can be used to launch Graph Node

To use:

```bash
node apply-cache-config.js
```

Then start Graph Node with:

```bash
env $(cat .env.graph-node) graph-node --config config.toml
```

## Caching Best Practices

### 1. Query Result Caching

- Use the `GRAPH_QUERY_CACHE_BLOCKS` and `GRAPH_QUERY_CACHE_MAX_MEM` environment variables
- For frequently changing data, use shorter cache TTLs
- For analytics and historical data, use longer cache TTLs

### 2. Redis for Distributed Setups

For multi-node Graph Node deployments:

- Set up Redis as a distributed cache
- Configure in `config.toml` under the appropriate sections
- Ensure consistent Redis configuration across all nodes

### 3. Database Query Optimization

For frequently accessed entities:

- Use the account-like optimization for entities that are updated often
- Run the following command to enable this optimization:

```bash
graphman stats account-like <sgdNNN>.<table>
```

### 4. Cache Invalidation Handling

Cache invalidation happens automatically when:

- A new block is indexed
- The schema is updated
- The node is restarted

For manual invalidation, you can:

- Clear the block cache: `graphman chain truncate <CHAIN>`
- Check block cache consistency: `graphman chain check-blocks <CHAIN> by-number <NUMBER>`

### 5. Monitoring Cache Performance

Monitor the following metrics:

- `apollo.router.cache.hit.time.count`
- `apollo.router.cache.miss.time.count`
- `apollo.router.query_planning.plan.duration`
- `apollo.router.cache.size`

## Optimizing Specific Queries

For high-priority queries like `GetHolderDocuments` and `GetDocumentDetails`:

1. Ensure the entities they access are properly optimized in the database
2. Consider adding database indexes for common query patterns
3. Test these queries under load to verify cache effectiveness

## Handling Cache Poisoning

If incorrect data has been cached:

1. Clear the eth_call cache: `graphman chain call-cache <CHAIN> remove`
2. Verify and clear specific blocks if needed: `graphman chain check-blocks <CHAIN> by-number <NUMBER>`
3. In extreme cases, truncate the entire block cache: `graphman chain truncate <CHAIN>`

## References

- [Graph Node Documentation](https://github.com/graphprotocol/graph-node/tree/master/docs)
- [Graph Node Configuration Reference](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md)
- [Environment Variables Reference](https://github.com/graphprotocol/graph-node/blob/master/docs/environment-variables.md)
- [Graphman CLI Reference](https://github.com/graphprotocol/graph-node/blob/master/docs/graphman.md)
