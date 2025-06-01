#!/bin/bash

# Setup all roles for the DocuVault system

echo "Setting up all roles for DocuVault system..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run a script and check result
run_script() {
    local script_name=$1
    echo -e "\n${GREEN}Running $script_name...${NC}"
    
    if npx hardhat run "scripts/$script_name" --network localhost; then
        echo -e "${GREEN}✓ $script_name completed successfully${NC}"
    else
        echo -e "${RED}✗ $script_name failed${NC}"
        exit 1
    fi
}

# Make sure we're in the right directory
cd "$(dirname "$0")/.." || exit

# Check if contracts are deployed
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Please run deployment first.${NC}"
    exit 1
fi

# Run all registration scripts in order
echo -e "\n${GREEN}Starting role registration process...${NC}"

# Option 1: Run individual scripts in sequence
# run_script "register-admin.ts"
# run_script "register-issuer.ts"
# run_script "register-holder.ts"
# run_script "register-verifier.ts"

# Option 2: Run the all-in-one script
run_script "register-all-roles.ts"

echo -e "\n${GREEN}========================================"
echo "All roles have been set up successfully!"
echo -e "========================================${NC}"
echo ""
echo "Account roles:"
echo "  Account 0: Deployer (contract owner)"
echo "  Account 1: Admin"
echo "  Account 2: Issuer"
echo "  Account 3: Holder"
echo "  Account 4: Verifier"
echo ""
echo "You can now use these accounts in your tests and frontend!"