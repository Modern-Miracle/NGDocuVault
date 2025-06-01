#!/bin/bash

# Script to prepare the Document Verification System subgraph for production deployment
set -e

echo "🚀 Preparing Document Verification System subgraph for production deployment"

# Check if GRAPH_ACCESS_TOKEN is set
if [ -z "$GRAPH_ACCESS_TOKEN" ]; then
  echo "❌ Error: GRAPH_ACCESS_TOKEN environment variable not set"
  echo "Please set your Graph access token:"
  echo "export GRAPH_ACCESS_TOKEN=your-access-token"
  exit 1
fi

# Check if SUBGRAPH_NAME is set
if [ -z "$SUBGRAPH_NAME" ]; then
  echo "❌ Error: SUBGRAPH_NAME environment variable not set"
  echo "Please set your subgraph name:"
  echo "export SUBGRAPH_NAME=your-github-username/docuvault"
  exit 1
fi

# Check if NETWORK is set
if [ -z "$NETWORK" ]; then
  echo "ℹ️ NETWORK environment variable not set, defaulting to 'mainnet'"
  NETWORK="mainnet"
fi

# Update the contract addresses in subgraph.yaml for the specified network
echo "🔄 Updating contract addresses for network: $NETWORK"
cd "$(dirname "$0")/.." && node update-contract.js $NETWORK

# Generate AssemblyScript types from schema
echo "📝 Generating types from schema..."
cd "$(dirname "$0")/.." && npm run codegen

# Build the subgraph
echo "🔨 Building the subgraph..."
cd "$(dirname "$0")/.." && npm run build

# Prepare the build folder
echo "📦 Preparing build for production..."
cd "$(dirname "$0")/.."

# Create a production-ready archive
VERSION=$(date '+%Y%m%d%H%M%S')
ARCHIVE_NAME="subgraph-$NETWORK-$VERSION.tar.gz"

tar -czf $ARCHIVE_NAME \
    --exclude="node_modules" \
    --exclude=".turbo" \
    --exclude="dist" \
    --exclude="generated" \
    --exclude="build/contracts" \
    subgraph.yaml \
    schema.graphql \
    build/schema.graphql \
    build/subgraph.yaml \
    src/

echo "📋 Production deployment instructions:"
echo "1. Upload the generated archive: $ARCHIVE_NAME"
echo "2. To authenticate with the Graph CLI, run:"
echo "   graph auth --product hosted-service $GRAPH_ACCESS_TOKEN"
echo "3. To deploy to the hosted service, run:"
echo "   graph deploy --product hosted-service $SUBGRAPH_NAME"
echo ""
echo "✅ Production preparation complete!" 
