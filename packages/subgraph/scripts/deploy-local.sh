#!/bin/bash

# Script to deploy the Document Verification System subgraph to a local Graph Node
set -e

echo "🚀 Starting local deployment for Document Verification System subgraph"

# Check if the Docker containers are running
if ! docker ps | grep -q "graph-node"; then
  echo "❌ Graph Node container is not running. Starting Docker services..."
  cd "$(dirname "$0")/.." && docker-compose up -d
  
  # Wait for Graph Node to start up
  echo "⏳ Waiting for Graph Node to start up..."
  sleep 10
fi

# Generate AssemblyScript types from schema
echo "📝 Generating types from schema..."
cd "$(dirname "$0")/.." && npm run codegen

# Build the subgraph
echo "🔨 Building the subgraph..."
cd "$(dirname "$0")/.." && npm run build

# Check if the subgraph exists
if graph list --node http://localhost:8020/ | grep -q "docuvault"; then
  # Remove the existing subgraph
  echo "🗑️ Removing existing subgraph..."
  cd "$(dirname "$0")/.." && npm run remove-local
fi

# Create a new subgraph
echo "✨ Creating new subgraph..."
cd "$(dirname "$0")/.." && npm run create-local

# Deploy the subgraph
echo "📦 Deploying the subgraph..."
cd "$(dirname "$0")/.." && npm run deploy-local

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Subgraph deployed successfully!"
  echo "📊 GraphQL endpoint: http://localhost:8000/subgraphs/name/docu/document-verification"
  echo "🔍 Graph Node UI: http://localhost:8000/"
else
  echo "❌ Subgraph deployment failed!"
  exit 1
fi

# Run test queries
echo "🧪 Running test queries..."
cd "$(dirname "$0")/.." && npm run test:queries

# Verify entity relationships
echo "🔄 Verifying entity relationships and data integrity..."
cd "$(dirname "$0")/.." && npm run test:verify

echo "🎉 Local deployment process completed!" 
