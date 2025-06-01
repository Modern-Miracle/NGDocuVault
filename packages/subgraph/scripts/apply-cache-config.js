#!/usr/bin/env node
/**
 * Graph Node Caching Configuration Helper
 *
 * This script helps configure caching for Graph Node using
 * officially supported environment variables and settings.
 *
 * Graph Node provides built-in caching for:
 * 1. Query results - Caches GraphQL query results
 * 2. Block data - Caches blockchain blocks
 * 3. eth_call data - Caches results of eth_call RPC method calls
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const dotenv = require('dotenv');

// Cache configuration file
const CACHE_CONFIG_FILE = path.join(__dirname, 'cache-config.yaml');
const ENV_FILE = path.join(__dirname, '.env.graph-node');

async function generateGraphNodeEnv() {
  try {
    console.log('Reading cache configuration file...');
    const cacheConfig = yaml.load(fs.readFileSync(CACHE_CONFIG_FILE, 'utf8'));

    // Extract global settings
    const global = cacheConfig.global || { ttl: 3600, maxSize: 1000 };

    // Calculate an appropriate query cache size based on the config
    // Sum the maxSize values of query-specific caches to get a reasonable total
    const queryCacheSize = Object.values(cacheConfig.queries || {}).reduce(
      (total, query) => total + (query.maxSize || 0),
      0
    );

    // Environment variables for Graph Node caching
    const envVars = {
      // Query cache settings
      GRAPH_QUERY_CACHE_BLOCKS: '100', // Cache queries for 100 blocks (recommended)
      GRAPH_QUERY_CACHE_MAX_MEM: `${Math.max(queryCacheSize * 5, 1000)}MB`, // Based on query config

      // Other performance-related settings
      GRAPH_ETHEREUM_BLOCK_BATCH_SIZE: '10', // Number of blocks to request in one batch
      GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE: '1000', // Maximum block range for event queries

      // Store performance
      GRAPH_STORE_CONNECTION_POOL_SIZE: '10', // DB connection pool size

      // For improved logging of query performance
      GRAPH_LOG_QUERY_TIMING: 'gql,cache', // Log query execution and cache times
    };

    // For block time-based cache freshness
    if (global.ttl) {
      // Convert seconds to blocks (assuming ~12 second block time for Ethereum)
      const blocksEquivalent = Math.ceil(global.ttl / 12);
      envVars['GRAPH_QUERY_CACHE_BLOCKS'] = blocksEquivalent.toString();
    }

    // Write to .env file
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(ENV_FILE, envContent);

    console.log('✅ Graph Node cache configuration generated successfully!');
    console.log(`Environment variables written to: ${ENV_FILE}`);
    console.log('\nTo apply these settings, use:');
    console.log('  1. Source the environment file before starting Graph Node');
    console.log('  2. Or start Graph Node with: env $(cat .env.graph-node) graph-node start');
    console.log('\nFor distributed setups:');
    console.log('  - Consider adding Redis caching to your graph-node config.toml file');
    console.log('  - See: https://github.com/graphprotocol/graph-node/blob/master/docs/config.md');
  } catch (error) {
    console.error('Error generating Graph Node environment:', error);
    process.exit(1);
  }
}

// Run the function
generateGraphNodeEnv();
