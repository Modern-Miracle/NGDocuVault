#!/bin/bash
# DocuVault Graph Node Cache Configuration Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
CONFIG_DIR="$SCRIPT_DIR"
GRAPH_NODE_DIR="$SCRIPT_DIR/.."

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}DocuVault Graph Node Cache Configuration${RESET}\n"

# Check dependencies
echo "Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is required but not found.${RESET}"
    exit 1
fi

# Check if required files exist
if [ ! -f "$CONFIG_DIR/cache-config.yaml" ]; then
    echo -e "${YELLOW}Error: cache-config.yaml not found in $CONFIG_DIR${RESET}"
    exit 1
fi

if [ ! -f "$CONFIG_DIR/config.toml" ]; then
    echo -e "${YELLOW}Error: config.toml not found in $CONFIG_DIR${RESET}"
    exit 1
fi

if [ ! -f "$CONFIG_DIR/apply-cache-config.js" ]; then
    echo -e "${YELLOW}Error: apply-cache-config.js not found in $CONFIG_DIR${RESET}"
    exit 1
fi

# Install required Node.js dependencies if needed
echo "Checking Node.js dependencies..."
if ! command -v js-yaml &> /dev/null || ! command -v dotenv &> /dev/null; then
    echo "Installing required npm packages..."
    cd "$CONFIG_DIR" && npm install --silent js-yaml dotenv
fi

# Generate environment variables from cache config
echo "Generating environment variables from cache configuration..."
node "$CONFIG_DIR/apply-cache-config.js"

if [ ! -f "$CONFIG_DIR/.env.graph-node" ]; then
    echo -e "${YELLOW}Error: Failed to generate .env.graph-node file${RESET}"
    exit 1
fi

echo -e "${GREEN}✓ Successfully generated cache configuration!${RESET}\n"
echo -e "To apply this configuration to Graph Node, use one of the following methods:"
echo -e "\n${BOLD}Method 1: Source the environment file${RESET}"
echo -e "  source $CONFIG_DIR/.env.graph-node"
echo -e "  graph-node --config $CONFIG_DIR/config.toml"
echo
echo -e "${BOLD}Method 2: Start with env variables inline${RESET}"
echo -e "  env \$(cat $CONFIG_DIR/.env.graph-node) graph-node --config $CONFIG_DIR/config.toml"
echo
echo -e "${BOLD}Method 3: Docker Compose setup${RESET}"
echo -e "  Add the following to your docker-compose.yml file:"
echo -e "  ---"
echo -e "  graph-node:"
echo -e "    env_file:"
echo -e "      - $CONFIG_DIR/.env.graph-node"
echo -e "    command: ['--config', '$CONFIG_DIR/config.toml']"
echo

# Print key caching metrics to monitor
echo -e "${BOLD}Important metrics to monitor for cache performance:${RESET}"
echo -e "  - apollo.router.cache.hit.time.count"
echo -e "  - apollo.router.cache.miss.time.count"
echo -e "  - apollo.router.query_planning.plan.duration"
echo -e "  - apollo.router.cache.size\n"

echo -e "For more information, see: ${BLUE}$CONFIG_DIR/CACHING.md${RESET}\n"

# Make the script executable when created
chmod +x "$0" 
