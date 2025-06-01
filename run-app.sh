#!/bin/bash

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Flag to track if we're in the cleanup process
CLEANUP_IN_PROGRESS=0

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
  exit 1
}

# Store PIDs for cleanup
TERMINAL_PIDS_FILE="/tmp/docu-terminals-$$.pids"
BG_PIDS_FILE="/tmp/docu-bg-$$.pids"

# Initialize PID tracking files
touch "$TERMINAL_PIDS_FILE" "$BG_PIDS_FILE"

# Function to open a command in a new terminal window
open_in_terminal() {
    local title=$1
    local cmd=$2
    local working_dir=$3
    
    log "Opening $title in a new terminal..."
    
    # Create a script to run in the new terminal
    TMP_SCRIPT=$(mktemp /tmp/docu-XXXXXX.sh)
    cat > "$TMP_SCRIPT" << EOF
#!/bin/bash
cd "$working_dir" || exit 1
echo -e "\033[1;34m====== $title ======\033[0m"
echo -e "\033[0;33mRunning: $cmd\033[0m"
echo -e "\033[0;33mWorking directory: $(pwd)\033[0m"
echo -e "\033[0;33m==========================================\033[0m"
$cmd
# Keep terminal open after command completes
echo -e "\033[0;31m$title process has exited. Press Enter to close this terminal.\033[0m"
read
EOF
    
    chmod +x "$TMP_SCRIPT"
    
    # List of terminal emulators to try
    terminal_cmds=(
        "x-terminal-emulator -e"
        "gnome-terminal -- bash -c"
        "konsole --new-tab -e"
        "xterm -T '$title' -e"
        "terminator -e"
        "mate-terminal --title='$title' -e"
        "tilix -e"
        "kitty -T '$title'"
    )
    
    # Try each terminal emulator until one works
    for term_cmd in "${terminal_cmds[@]}"; do
        term_bin=$(echo "$term_cmd" | awk '{print $1}')
        if command -v "$term_bin" > /dev/null 2>&1; then
            # Format the command based on terminal requirements
            if [[ "$term_cmd" == *"kitty"* ]]; then
                $term_bin "$TMP_SCRIPT" > /dev/null 2>&1 &
            else
                $term_cmd "'$TMP_SCRIPT'" > /dev/null 2>&1 &
            fi
            
            # If the command succeeded
            if [ $? -eq 0 ]; then
                log_success "Started $title in new terminal window using $term_bin"
                # Save the PID of the terminal for cleanup
                echo $! >> "$TERMINAL_PIDS_FILE"
                return 0
            fi
        fi
    done
    
    # If all terminal emulators failed, fall back to running in background
    log_warning "Could not open new terminal window. Running $title in the background."
    (cd "$working_dir" && $cmd) &
    echo $! >> "$BG_PIDS_FILE"
    return 0
}

# Function to clean up processes using specific ports
cleanup_ports() {
  local port=$1
  local service_name=$2
  
  log "Checking for processes using port $port ($service_name)..."
  
  local pid=$(lsof -i:$port -t 2>/dev/null)
  if [ -n "$pid" ]; then
    log_warning "Found process (PID: $pid) using port $port. Attempting to terminate..."
    kill -9 $pid 2>/dev/null || true
    sleep 2
    log_success "Terminated process on port $port"
  else
    log "No conflicts found on port $port"
  fi
}

# Function to clean up on exit
cleanup_on_exit() {
  # Prevent multiple executions
  if [ $CLEANUP_IN_PROGRESS -eq 1 ]; then
    return
  fi
  
  CLEANUP_IN_PROGRESS=1
  log "Cleaning up before exit..."
  
  # Kill terminal processes
  if [ -f "$TERMINAL_PIDS_FILE" ]; then
    while read pid; do
      if kill -0 $pid 2>/dev/null; then
        log "Killing terminal window (PID: $pid)"
        kill $pid 2>/dev/null || true
      fi
    done < "$TERMINAL_PIDS_FILE"
    rm -f "$TERMINAL_PIDS_FILE"
  fi
  
  # Kill background processes
  if [ -f "$BG_PIDS_FILE" ]; then
    while read pid; do
      if kill -0 $pid 2>/dev/null; then
        log "Killing background process (PID: $pid)"
        pkill -P $pid 2>/dev/null || true
        kill -9 $pid 2>/dev/null || true
      fi
    done < "$BG_PIDS_FILE"
    rm -f "$BG_PIDS_FILE"
  fi
  
  # Kill processes by port
  HARDHAT_PROCESSES=$(lsof -ti:8545 2>/dev/null)
  API_PROCESSES=$(lsof -ti:5000 2>/dev/null)
  WEB_PROCESSES=$(lsof -ti:3000 2>/dev/null)
  DOCS_PROCESSES=$(lsof -ti:3001 2>/dev/null)
  GRAPH_PROCESSES=$(lsof -ti:8000,8001,8020,8030,8040 2>/dev/null)
  
  # Kill any remaining processes using these ports
  if [ ! -z "$HARDHAT_PROCESSES" ]; then
    log "Killing processes on port 8545: $HARDHAT_PROCESSES"
    kill -9 $HARDHAT_PROCESSES 2>/dev/null || true
  fi
  
  if [ ! -z "$API_PROCESSES" ]; then
    log "Killing processes on port 5000: $API_PROCESSES"
    kill -9 $API_PROCESSES 2>/dev/null || true
  fi
  
  if [ ! -z "$WEB_PROCESSES" ]; then
    log "Killing processes on port 3000: $WEB_PROCESSES"
    kill -9 $WEB_PROCESSES 2>/dev/null || true
  fi
  
  if [ ! -z "$DOCS_PROCESSES" ]; then
    log "Killing processes on port 3001: $DOCS_PROCESSES"
    kill -9 $DOCS_PROCESSES 2>/dev/null || true
  fi
  
  if [ ! -z "$GRAPH_PROCESSES" ]; then
    log "Killing Graph node processes: $GRAPH_PROCESSES"
    kill -9 $GRAPH_PROCESSES 2>/dev/null || true
  fi
  
  # Clean up temporary scripts
  rm -f /tmp/docu-*.sh 2>/dev/null || true
  
  # Kill any existing hardhat node processes
  pkill -f "hardhat node" || true
  
  # Stop any API processes
  pkill -f "pnpm dev:api" || true
  
  # Stop any web/docs processes
  pkill -f "pnpm dev" || true
  
  # Stop any graph processes
  cd packages/subgraph 2>/dev/null && docker compose down || true
  cd - > /dev/null
  
  log_success "Cleanup complete"
}

# Register the cleanup function to run on exit signals
trap 'cleanup_on_exit' EXIT INT TERM

# Initial cleanup
cleanup() {
  log "Cleaning up existing processes and containers..."
  
  # Check for any processes using our ports and kill them
  cleanup_ports 8545 "Hardhat"
  cleanup_ports 5000 "API"
  cleanup_ports 3000 "Web app"
  cleanup_ports 3001 "Docs app"
  cleanup_ports 8000 "Graph query"
  cleanup_ports 8020 "Graph admin"
  cleanup_ports 8030 "Graph index"
  cleanup_ports 8040 "Graph metrics"
  
  # Kill any existing hardhat node processes
  pkill -f "hardhat node" || true
  
  # Stop any API processes
  pkill -f "pnpm dev:api" || true
  
  # Stop any web/docs processes
  pkill -f "pnpm dev" || true
  
  # Kill any Docker containers that might be related to our project
  log "Stopping Graph node containers if running..."
  cd packages/subgraph 2>/dev/null && docker compose down || true
  cd - > /dev/null
  
  # Clean up any previous PID files
  rm -f /tmp/docu-terminals-*.pids /tmp/docu-bg-*.pids /tmp/docu-*.sh
  
  log_success "Cleanup completed"

}

# First: Start Hardhat node
start_hardhat() {
  log "Starting Hardhat node..."
  
  # Navigate to contract directory
  cd apps/contract
  
  # Make sure the script is executable
  chmod +x scripts/start-node.sh
  
  # Start the node in a new terminal
  open_in_terminal "Hardhat Node" "./scripts/start-node.sh" "$(pwd)"
  
  # Wait for Hardhat node to start (checking port 8545)
  log "Waiting for Hardhat node to start..."
  max_attempts=30
  attempt=0
  
  while ! curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    http://localhost:8545 > /dev/null; do
    sleep 2
    attempt=$((attempt+1))
    if [ $attempt -ge $max_attempts ]; then
      log_error "Hardhat node failed to start within the expected time."
    fi
    log "Still waiting for Hardhat node... ($attempt/$max_attempts)"
  done
  
  log_success "Hardhat node started successfully"
  cd ../..
}

# Second: Deploy contracts
deploy_contracts() {
  log "Deploying contracts using deploy-and-update-subgraph.sh..."
  cd apps/contract
  
  # Make sure the script is executable
  chmod +x scripts/deploy-and-update-subgraph.sh
  
  # Run the deployment script
  ./scripts/deploy-and-update-subgraph.sh
  
  if [ $? -ne 0 ]; then
    log_error "Failed to deploy contracts"
  fi
  
  log_success "Contracts deployed successfully"
  cd ../..
}

# Third: Start Graph node and deploy subgraph
start_graph() {
  log "Starting Graph node using sync-hardhat.sh..."
  cd packages/subgraph
  
  # Make sure the script is executable
  chmod +x scripts/sync-hardhat.sh
  
  # Run the graph sync script
  ./scripts/sync-hardhat.sh
  
  if [ $? -ne 0 ]; then
    log_error "Failed to start Graph node and deploy subgraph"
  fi
  
  log_success "Graph node started and subgraph deployed successfully"
  cd ../..
}

# Fourth: Start API
start_api() {
  log "Starting API server..."
  
  # Get absolute path to API directory
  API_DIR="$(pwd)/apps/api"
  
  # Navigate to API directory
  cd "$API_DIR"
  
  # Start the API in a new terminal
  open_in_terminal "API Server" "pnpm dev:api" "$API_DIR"
  
  # Wait for API to start (checking port 5000)
  log "Waiting for API to start..."
  max_attempts=30
  attempt=0
  
  while ! curl -s http://localhost:5000 > /dev/null; do
    sleep 2
    attempt=$((attempt+1))
    if [ $attempt -ge $max_attempts ]; then
      log_warning "API may not have started properly, but continuing..."
      break
    fi
    log "Still waiting for API... ($attempt/$max_attempts)"
  done
  
  log_success "API started successfully"
  cd ../..
}

# Fifth: Start web apps
start_web_apps() {
  log "Starting web applications with pnpm dev..."
  
  # Run pnpm dev in the foreground to keep the script running
  log_success "Running: pnpm dev"
  echo -e "${YELLOW}Press Ctrl+C when you want to stop all applications${NC}"
  
  # Run pnpm dev in the foreground - this will block until user stops it
  pnpm dev
}

# Main function
main() {
  log "Starting DocuVault application stack..."
  
  # Clean up first
  cleanup
  
  # Start components sequentially
  start_hardhat
  deploy_contracts
  # start_graph
  start_api
  start_web_apps
  
  # Web apps stopped, main script ends, cleanup_on_exit will be called by trap
}

# Run the main function
main
