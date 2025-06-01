#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function for displaying messages
log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to update an address in the subgraph.yaml file
update_address() {
  local data_source=$1
  local address=$2
  local file=$3
  
  if [ -z "$address" ]; then
    log_warning "No address provided for $data_source. Skipping..."
    return
  fi
  
  log "Updating $data_source address to $address"
  
  # Use sed to update the address in the subgraph.yaml file
  # The pattern matches the line that has the address field for the specific data source
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires an empty string for the -i parameter
    sed -i '' -E "/name: $data_source/,/address:/ s/address: '0x[a-fA-F0-9]*'/address: '$address'/" $file
  else
    # Linux doesn't
    sed -i -E "/name: $data_source/,/address:/ s/address: '0x[a-fA-F0-9]*'/address: '$address'/" $file
  fi
  
  if [ $? -ne 0 ]; then
    log_error "Failed to update $data_source address in $file"
    exit 1
  fi
}

# Main script execution
main() {
  log "Starting subgraph address update..."
  
  # Define the subgraph.yaml file path
  SUBGRAPH_FILE="subgraph.yaml"
  
  # Check if subgraph.yaml exists
  if [ ! -f "$SUBGRAPH_FILE" ]; then
    log_error "subgraph.yaml not found in current directory!"
    exit 1
  fi
  
  # Get addresses from environment variables or command line arguments
  DOCU_VAULT_ADDRESS=${DOCU_VAULT_CONTRACT_ADDRESS:-$1}
  DID_REGISTRY_ADDRESS=${DID_REGISTRY_CONTRACT_ADDRESS:-$2}
  DID_VERIFIER_ADDRESS=${DID_VERIFIER_CONTRACT_ADDRESS:-$3}
  DID_ISSUER_ADDRESS=${DID_ISSUER_CONTRACT_ADDRESS:-$4}
  DID_AUTH_ADDRESS=${DID_AUTH_CONTRACT_ADDRESS:-$5}
  
  # Update addresses in subgraph.yaml
  update_address "DocuVault" "$DOCU_VAULT_ADDRESS" "$SUBGRAPH_FILE"
  update_address "DIDRegistry" "$DID_REGISTRY_ADDRESS" "$SUBGRAPH_FILE"
  update_address "DIDVerifier" "$DID_VERIFIER_ADDRESS" "$SUBGRAPH_FILE"
  update_address "DIDIssuer" "$DID_ISSUER_ADDRESS" "$SUBGRAPH_FILE"
  update_address "DIDAuth" "$DID_AUTH_ADDRESS" "$SUBGRAPH_FILE"
  
  log_success "Subgraph addresses updated successfully!"
  
  # Output current addresses
  log "Current addresses in $SUBGRAPH_FILE:"
  grep -A 1 "address:" "$SUBGRAPH_FILE" | grep -E "address: '0x" | sed 's/^[[:space:]]*//'
}

# Show usage information
usage() {
  echo "Usage: $0 [DocuVault_address] [DIDRegistry_address] [DIDVerifier_address] [DIDIssuer_address] [DIDAuth_address]"
  echo ""
  echo "You can also set environment variables:"
  echo "  DOCU_VAULT_CONTRACT_ADDRESS"
  echo "  DID_REGISTRY_CONTRACT_ADDRESS" 
  echo "  DID_VERIFIER_CONTRACT_ADDRESS"
  echo "  DID_ISSUER_CONTRACT_ADDRESS"
  echo "  DID_AUTH_CONTRACT_ADDRESS"
  echo ""
  echo "Example:"
  echo "  $0 0x123... 0x456... 0x789... 0xabc... 0xdef..."
  echo "  or"
  echo "  export DOCU_VAULT_CONTRACT_ADDRESS=0x123..."
  echo "  $0"
}

# If asking for help
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
  exit 0
fi

# Run the main function
main "$@" 
