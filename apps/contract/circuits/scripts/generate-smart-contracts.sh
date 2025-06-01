#!/bin/bash

# Master script to generate smart contracts for all circuits
# Author: LeLink Team

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PTAU_DIR="$SCRIPT_DIR/../ptau"

echo "=== LeLink Smart Contract Generator ==="
echo "This script will generate Solidity contracts for all Circom circuits"
echo

# Check for required ptau files
if [ ! -f "$PTAU_DIR/pot12_final.ptau" ] || [ ! -f "$PTAU_DIR/pot14_final.ptau" ]; then
  echo "Error: Required ptau files not found in $PTAU_DIR"
  echo "Please ensure both pot12_final.ptau and pot14_final.ptau are present."
  exit 1
fi
echo "Found required ptau files."

# Make sure all scripts are executable
chmod +x "$SCRIPT_DIR/generate-verifier-contracts.js"
chmod +x "$SCRIPT_DIR/integrate-verifiers.js"
chmod +x "$SCRIPT_DIR/generate-verifier-contracts.sh"

# Check if circom is installed
if ! command -v circom &> /dev/null; then
  echo "Error: circom is not installed or not in PATH"
  echo "Please install circom first: https://docs.circom.io/getting-started/installation/"
  exit 1
fi

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
  echo "Error: snarkjs is not installed or not in PATH"
  echo "Please install snarkjs first: npm install -g snarkjs"
  exit 1
fi

echo "Found required tools: circom and snarkjs."
echo

# Step 1: Generate the verifier contracts
echo "Step 1/2: Generating verifier contracts..."
"$SCRIPT_DIR/generate-verifier-contracts.sh"
echo

# Step 2: Integrate the verifiers with the smart contract system
echo "Step 2/2: Integrating verifier contracts with smart contract system..."
node "$SCRIPT_DIR/integrate-verifiers.js"
echo

echo "=== Smart Contract Generation Complete ==="
echo "The following files have been generated:"
echo "- Verifier contracts in $PROJECT_ROOT/src/verifiers/"
echo "- IZKPVerifier interface in $PROJECT_ROOT/src/interfaces/"
echo "- VerifierFactory in $PROJECT_ROOT/src/"
echo
echo "You can now import and use these contracts in your main smart contracts."
echo
echo "Example usage in your contract:"
echo "---------------------------------"
echo "import \"./VerifierFactory.sol\";"
echo
echo "contract YourContract {"
echo "    VerifierFactory public verifierFactory;"
echo
echo "    constructor() {"
echo "        verifierFactory = new VerifierFactory();"
echo "    }"
echo
echo "    function verifyHashProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) public view returns (bool) {"
echo "        return verifierFactory.verifyHashVerifier(a, b, c, input);"
echo "    }"
echo "}"
echo "---------------------------------"
echo
echo "Happy coding!" 
