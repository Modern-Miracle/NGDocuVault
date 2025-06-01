#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const schemaPackagePath = path.resolve(__dirname, '../../graphql-schema/schema.graphql');
const subgraphSchemaPath = path.resolve(__dirname, '../schema.graphql');

// Function to synchronize schemas
function syncSchema() {
  try {
    if (!fs.existsSync(schemaPackagePath)) {
      console.error('Source schema not found at:', schemaPackagePath);
      process.exit(1);
    }

    // Read the source schema
    const schemaContent = fs.readFileSync(schemaPackagePath, 'utf8');

    // Write to subgraph schema
    fs.writeFileSync(subgraphSchemaPath, schemaContent);

    console.log('Schema successfully synchronized from graphql-schema package');
  } catch (error) {
    console.error('Error synchronizing schema:', error);
    process.exit(1);
  }
}

// Run the synchronization
syncSchema();
