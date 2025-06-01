#!/bin/bash

# Script to start a Hardhat node configured for The Graph
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  Starting Hardhat Node for The Graph     ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Ensure we're in the right directory
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
cd "$SCRIPT_DIR/.."

# Check if hardhat is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not installed or not in the PATH${NC}"
    exit 1
fi

# First, check if a node is already running
if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 &> /dev/null; then
    echo -e "${YELLOW}Warning: A node is already running at http://localhost:8545${NC}"
    echo -e "${YELLOW}If you want to restart, please kill the existing process first${NC}"
    exit 1
fi

# Clean any previous Hardhat state to ensure a fresh node
echo -e "${YELLOW}Cleaning previous Hardhat state...${NC}"
npx hardhat clean

# Start the Hardhat node with optimized parameters for The Graph
echo -e "${YELLOW}Starting Hardhat node...${NC}"
echo -e "${GREEN}The node will be available at: http://localhost:8545${NC}"
echo -e "${YELLOW}Use Ctrl+C to stop the node when finished${NC}"
echo -e "${BLUE}==========================================${NC}"

# Start the Hardhat node
npx hardhat node --hostname 0.0.0.0
