#!/bin/bash

# Script to synchronize your local Hardhat node with The Graph
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  Hardhat + The Graph Synchronizer        ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Ensure we're in the right directory
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
cd "$SCRIPT_DIR/.."

# 1. Check if docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in the PATH${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running or you don't have permission${NC}"
    exit 1
fi

# 2. Check if Hardhat node is running
echo -e "${YELLOW}Checking if Hardhat node is running...${NC}"
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 &> /dev/null; then
    echo -e "${RED}Error: Hardhat node is not running at http://localhost:8545${NC}"
    echo -e "${YELLOW}Please start your Hardhat node in another terminal:${NC}"
    echo -e "cd ../../apps/contract && npx hardhat node"
    exit 1
fi

echo -e "${GREEN}✓ Hardhat node is running${NC}"

# 3. Reset Graph node (stop, clean, and restart)
echo -e "${YELLOW}Resetting Graph Node...${NC}"
docker compose down

# Check if the data directories exist
if [ -d "./data/postgres" ] || [ -d "./data/ipfs" ]; then
    echo -e "${YELLOW}Removing old Graph node data...${NC}"
    sudo rm -rf ./data/postgres
    sudo rm -rf ./data/ipfs
    echo -e "${GREEN}✓ Old data removed${NC}"
fi

# Remove any dangling containers
docker container prune -f &> /dev/null

# 4. Start Graph node
echo -e "${YELLOW}Starting The Graph node...${NC}"
docker compose up -d

# Wait for Graph node to be ready
echo -e "${YELLOW}Waiting for The Graph node to be ready...${NC}"
MAX_ATTEMPTS=30
ATTEMPTS=0
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:8000/ &> /dev/null; then
        echo -e "${GREEN}✓ The Graph node is up and running${NC}"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    echo -n "."
    sleep 1
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}Error: The Graph node did not start in time${NC}"
    echo -e "${YELLOW}Check the logs with:${NC} docker compose logs -f graph-node"
    exit 1
fi

# 5. Build and deploy the subgraph
echo -e "${YELLOW}Generating subgraph code...${NC}"
npm run codegen

echo -e "${YELLOW}Building subgraph...${NC}"
npm run build

# 6. Check if subgraph exists and create or update as needed
echo -e "${YELLOW}Checking if subgraph already exists...${NC}"
if ! curl -s http://localhost:8020/graphql -X POST -H "Content-Type: application/json" -d '{"query": "{ indexingStatuses { subgraph } }"}' | grep -q "docuvault"; then
    echo -e "${YELLOW}Creating subgraph...${NC}"
    npm run create-local || true
    echo -e "${GREEN}✓ Subgraph created${NC}"
else
    echo -e "${GREEN}✓ Subgraph already exists${NC}"
fi

echo -e "${YELLOW}Deploying subgraph...${NC}"
npm run deploy-local

# 7. Final check and information
echo -e "${GREEN}✓ Subgraph deployment complete!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  Hardhat + The Graph Sync Complete       ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}GraphQL Endpoint:${NC} http://localhost:8000/subgraphs/name/docuvault/graphql"
echo -e "${YELLOW}Graph Node UI:${NC} http://localhost:8000"
echo -e "${YELLOW}Monitor logs:${NC} docker compose logs -f graph-node"
echo -e ""
echo -e "${GREEN}You can now query your subgraph and interact with your contracts!${NC}" 
