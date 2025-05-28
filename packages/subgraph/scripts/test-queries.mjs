#!/usr/bin/env node

import { GraphQLClient, gql } from 'graphql-request';

const SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/docuvault';

// Test queries
const TEST_QUERIES = {
  // Test 1: Check if subgraph is deployed
  health: gql`
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
  `,

  // Test 2: Query documents
  documents: gql`
    {
      documents(first: 10) {
        id
        documentId
        documentType
        isVerified
        registeredAt
        issuer {
          id
          address
        }
        holder {
          id
          address
        }
      }
    }
  `,

  // Test 3: Query DIDs
  dids: gql`
    {
      dids(first: 10) {
        id
        did
        controller
        active
        lastUpdated
      }
    }
  `,

  // Test 4: Query issuers
  issuers: gql`
    {
      issuers(first: 10) {
        id
        address
        isActive
        registeredAt
      }
    }
  `,

  // Test 5: Query holders
  holders: gql`
    {
      holders(first: 10) {
        id
        address
        documents {
          id
          documentType
        }
      }
    }
  `
};

async function runTests() {
  const client = new GraphQLClient(SUBGRAPH_URL);
  
  console.log('🧪 Testing subgraph queries...\n');

  for (const [name, query] of Object.entries(TEST_QUERIES)) {
    try {
      console.log(`📊 Running ${name} query...`);
      const result = await client.request(query);
      console.log('✅ Success:', JSON.stringify(result, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Failed ${name} query:`, error);
      console.log('---\n');
    }
  }
}

// Check if subgraph is available
async function checkSubgraphAvailability() {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking subgraph availability...');
  
  const isAvailable = await checkSubgraphAvailability();
  
  if (!isAvailable) {
    console.error('❌ Subgraph is not available at:', SUBGRAPH_URL);
    console.log('\nPlease ensure:');
    console.log('1. The Graph Node is running (docker compose up -d)');
    console.log('2. The subgraph is deployed (pnpm deploy:hardhat)');
    process.exit(1);
  }

  console.log('✅ Subgraph is available!\n');
  
  await runTests();
}

main().catch(console.error);