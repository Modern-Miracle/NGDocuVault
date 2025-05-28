#!/bin/bash

# Script to deploy the subgraph to a local Graph Node with Hardhat integration
# This script assumes:
# 1. Hardhat node is running locally on port 8545
# 2. Contracts are already deployed to the Hardhat node

set -e

echo "🚀 Starting local subgraph deployment for Hardhat..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}✗ $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=0
    
    echo "Waiting for $service_name to be ready..."
    while [ $attempt -lt $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✓ $service_name is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo -e "${RED}✗ $service_name failed to start${NC}"
    return 1
}

# Step 1: Check if Hardhat node is running
echo -e "\n${YELLOW}Step 1: Checking Hardhat node...${NC}"
if ! check_service "Hardhat node" 8545; then
    echo "Please start the Hardhat node first with: cd apps/contract && pnpm dev:contract"
    exit 1
fi

# Step 2: Update contract addresses from Hardhat deployment
echo -e "\n${YELLOW}Step 2: Updating contract addresses...${NC}"
cd "$(dirname "$0")/.."

# Sync contract addresses from Hardhat deployment
echo "Syncing contract addresses from Hardhat deployment..."
pnpm sync-addresses

# Step 3: Start Docker services
echo -e "\n${YELLOW}Step 3: Starting Docker services...${NC}"
echo "Starting IPFS, PostgreSQL, and Graph Node..."
docker compose up -d

# Wait for services to be ready
wait_for_service "IPFS" 5001
wait_for_service "PostgreSQL" 5433
wait_for_service "Graph Node Admin" 8020

# Give Graph Node a bit more time to fully initialize
echo "Waiting for Graph Node to fully initialize..."
sleep 5

# Step 4: Generate code and build
echo -e "\n${YELLOW}Step 4: Building subgraph...${NC}"
echo "Generating AssemblyScript types..."
pnpm codegen

echo "Building subgraph..."
pnpm build

# Step 5: Create and deploy the subgraph
echo -e "\n${YELLOW}Step 5: Deploying subgraph...${NC}"

# Remove existing subgraph if it exists
echo "Removing any existing subgraph deployment..."
pnpm remove-local || true

# Create the subgraph
echo "Creating subgraph..."
pnpm create-local

# Deploy the subgraph
echo "Deploying subgraph..."
pnpm deploy-local

# Step 6: Verify deployment
echo -e "\n${YELLOW}Step 6: Verifying deployment...${NC}"
sleep 3

# Check if subgraph is deployed
if curl -s http://localhost:8000/subgraphs/name/docuvault > /dev/null; then
    echo -e "${GREEN}✓ Subgraph deployed successfully!${NC}"
    echo -e "\n${GREEN}You can now:${NC}"
    echo "  - Query the subgraph at: http://localhost:8000/subgraphs/name/docuvault"
    echo "  - View logs with: pnpm logs"
    echo "  - Stop services with: pnpm stop-local"
else
    echo -e "${RED}✗ Subgraph deployment verification failed${NC}"
    echo "Check the logs with: pnpm logs"
    exit 1
fi

echo -e "\n${GREEN}🎉 Subgraph deployment complete!${NC}"