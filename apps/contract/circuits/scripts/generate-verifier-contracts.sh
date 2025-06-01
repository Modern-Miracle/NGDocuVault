#!/bin/bash

# This script generates Solidity verifier contracts for all Circom circuits
# Author: LeLink Team

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PTAU_DIR="$SCRIPT_DIR/../ptau"

echo "=== LeLink Verifier Contract Generator ==="
echo "Generating Solidity verifier contracts for all circuits..."

# Check if required ptau files exist
if [ ! -f "$PTAU_DIR/pot12_final.ptau" ] || [ ! -f "$PTAU_DIR/pot14_final.ptau" ]; then
  echo "Error: Required ptau files not found in $PTAU_DIR"
  echo "Please ensure both pot12_final.ptau and pot14_final.ptau are present."
  exit 1
fi

# Check if circomlib is installed
NODE_MODULES_DIR="$PROJECT_ROOT/node_modules"
if [ ! -d "$NODE_MODULES_DIR/circomlib" ]; then
  echo "Warning: circomlib not found in node_modules"
  echo "Installing circomlib..."
  cd "$PROJECT_ROOT" && npm install circomlib
fi

# Make sure the JavaScript file is executable
chmod +x "$SCRIPT_DIR/generate-verifier-contracts.js"

# Run the JavaScript script
echo "Executing verifier generation script..."
node "$SCRIPT_DIR/generate-verifier-contracts.js"

echo "=== Verifier contract generation completed ===" 
