#!/bin/bash

# Script to deploy contracts and update subgraph configuration
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  Contract Deployment & Subgraph Update   ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Ensure we're in the right directory
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
cd "$SCRIPT_DIR/.."

# Check if hardhat node is running
echo -e "${YELLOW}Checking if Hardhat node is running...${NC}"
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 &> /dev/null; then
    echo -e "${RED}Error: Hardhat node is not running at http://localhost:8545${NC}"
    echo -e "${YELLOW}Please start your Hardhat node first:${NC}"
    echo -e "./scripts/start-node.sh"
    exit 1
fi

echo -e "${GREEN}✓ Hardhat node is running${NC}"

# Deploy the contracts
echo -e "${YELLOW}Deploying contracts to local Hardhat node...${NC}"
npx hardhat deploy --network localhost

# Extract contract addresses from environment variables or from deployment output
SUBGRAPH_PATH="../../packages/subgraph"
SUBGRAPH_CONFIG="$SUBGRAPH_PATH/subgraph.yaml"

# Check if the subgraph.yaml file exists
if [ ! -f "$SUBGRAPH_CONFIG" ]; then
    echo -e "${RED}Error: subgraph.yaml not found at $SUBGRAPH_CONFIG${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contracts deployed successfully${NC}"
echo -e "${YELLOW}Contract addresses have been saved to environment files${NC}"
echo -e "${YELLOW}You can now run the Graph node sync script:${NC}"
echo -e "cd $SUBGRAPH_PATH && ./scripts/sync-hardhat.sh"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  Deployment Complete                     ${NC}"
echo -e "${BLUE}==========================================${NC}" 
