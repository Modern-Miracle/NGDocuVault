#!/bin/bash

# NGDocuVault Docker Startup Script
# This script provides easy commands to start the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[NGDocuVault]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    # Use 'docker compose' if available, otherwise fall back to 'docker-compose'
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
}

# Create environment file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env 2>/dev/null || {
            print_warning ".env.example not found. Creating basic .env file..."
            cat > .env << EOF
# NGDocuVault Environment Variables
# Copy from .env.example and customize for your deployment

# Database
POSTGRES_DB=ngdocuvault
POSTGRES_USER=ngdocuvault
POSTGRES_PASSWORD=change-this-secure-password

# JWT Secrets (CHANGE THESE IN PRODUCTION)
JWT_SECRET=dev-jwt-secret-change-in-production
SESSION_SECRET=dev-session-secret-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# IPFS Storage (optional - provide at least one)
WEB3_STORAGE_TOKEN=
PINATA_JWT=

# WalletConnect (optional)
VITE_WALLETCONNECT_PROJECT_ID=

# Production API URL (for web build)
VITE_API_BASE_URL=http://localhost:5000

# Blockchain
VITE_CHAIN_ID=31337

# Monitoring (optional)
GRAFANA_ADMIN_PASSWORD=admin
EOF
        }
        print_warning "Please edit .env file with your configuration before starting services."
    fi
}

# Show help
show_help() {
    echo "NGDocuVault Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  prod         Start production environment"
    echo "  stop         Stop all services"
    echo "  restart      Restart all services"
    echo "  logs         Show logs from all services"
    echo "  build        Build all Docker images"
    echo "  clean        Clean up Docker resources"
    echo "  status       Show status of all services"
    echo "  shell        Open shell in a service container"
    echo ""
    echo "Options:"
    echo "  --build      Force rebuild images"
    echo "  --monitoring Include monitoring stack (prod only)"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Start development environment"
    echo "  $0 dev --build           # Start dev environment with rebuild"
    echo "  $0 prod --monitoring     # Start production with monitoring"
    echo "  $0 logs api              # Show logs for API service"
    echo "  $0 shell api             # Open shell in API container"
}

# Start development environment
start_dev() {
    print_status "Starting NGDocuVault development environment..."
    
    local build_flag=""
    if [[ "$1" == "--build" ]]; then
        build_flag="--build"
        print_status "Building images..."
    fi
    
    $DOCKER_COMPOSE -f docker-compose.yml up -d $build_flag
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  • Web Application: http://localhost:3000"
    echo "  • API Backend: http://localhost:5000"
    echo "  • Blockchain Node: http://localhost:8545"
    echo "  • Database: localhost:1433"
    echo "  • IPFS Gateway: http://localhost:8080"
    echo "  • Redis: localhost:6379"
    echo ""
    print_status "View logs with: $0 logs"
    print_status "Stop services with: $0 stop"
}

# Start production environment
start_prod() {
    print_status "Starting NGDocuVault production environment..."
    
    local build_flag=""
    local profile_flag=""
    
    for arg in "$@"; do
        case $arg in
            --build)
                build_flag="--build"
                print_status "Building images..."
                ;;
            --monitoring)
                profile_flag="--profile monitoring"
                print_status "Including monitoring stack..."
                ;;
        esac
    done
    
    # Check for required production environment variables
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "change-this-secure-password" ]; then
        print_error "Please set a secure POSTGRES_PASSWORD in .env file"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "dev-jwt-secret-change-in-production" ]; then
        print_error "Please set a secure JWT_SECRET in .env file"
        exit 1
    fi
    
    $DOCKER_COMPOSE -f docker-compose.prod.yml up -d $build_flag $profile_flag
    
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  • Web Application: http://localhost (via nginx)"
    echo "  • API Backend: http://localhost/api (via nginx)"
    
    if [[ "$profile_flag" == *"monitoring"* ]]; then
        echo "  • Prometheus: http://localhost:9090"
        echo "  • Grafana: http://localhost:3001"
    fi
    
    echo ""
    print_warning "Production services are bound to localhost only."
    print_warning "Configure a reverse proxy (nginx/apache) for external access."
    print_status "View logs with: $0 logs"
    print_status "Stop services with: $0 stop"
}

# Stop services
stop_services() {
    print_status "Stopping NGDocuVault services..."
    
    # Try to stop both dev and prod compose files
    $DOCKER_COMPOSE -f docker-compose.yml down 2>/dev/null || true
    $DOCKER_COMPOSE -f docker-compose.prod.yml down 2>/dev/null || true
    
    print_success "All services stopped."
}

# Restart services
restart_services() {
    print_status "Restarting NGDocuVault services..."
    stop_services
    
    # Detect which environment was running and restart appropriately
    if docker ps -a --format "table {{.Names}}" | grep -q "ngdocuvault.*prod"; then
        start_prod "$@"
    else
        start_dev "$@"
    fi
}

# Show logs
show_logs() {
    local service="$1"
    
    if [ -n "$service" ]; then
        print_status "Showing logs for $service service..."
        if docker ps --format "table {{.Names}}" | grep -q "ngdocuvault.*prod"; then
            $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f "$service"
        else
            $DOCKER_COMPOSE -f docker-compose.yml logs -f "$service"
        fi
    else
        print_status "Showing logs for all services..."
        if docker ps --format "table {{.Names}}" | grep -q "ngdocuvault.*prod"; then
            $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f
        else
            $DOCKER_COMPOSE -f docker-compose.yml logs -f
        fi
    fi
}

# Build images
build_images() {
    print_status "Building all Docker images..."
    
    $DOCKER_COMPOSE -f docker-compose.yml build
    $DOCKER_COMPOSE -f docker-compose.prod.yml build
    
    print_success "All images built successfully!"
}

# Clean up Docker resources
clean_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Stop services first
    stop_services
    
    # Remove containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    read -p "Remove unused volumes? This will delete data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi
    
    print_success "Docker cleanup completed!"
}

# Show service status
show_status() {
    print_status "NGDocuVault Service Status:"
    echo ""
    
    # Check if any NGDocuVault containers are running
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "ngdocuvault"; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "ngdocuvault"
    else
        print_warning "No NGDocuVault services are currently running."
        echo "Start services with: $0 dev or $0 prod"
    fi
}

# Open shell in service container
open_shell() {
    local service="$1"
    
    if [ -z "$service" ]; then
        print_error "Please specify a service name: api, web, database, blockchain, etc."
        exit 1
    fi
    
    local container_name="ngdocuvault-$service"
    if docker ps --format "table {{.Names}}" | grep -q "ngdocuvault.*prod"; then
        container_name="ngdocuvault-$service-prod"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        print_status "Opening shell in $service container..."
        docker exec -it "$container_name" /bin/sh
    else
        print_error "Service $service is not running or container not found."
        print_status "Available services:"
        docker ps --format "table {{.Names}}" | grep "ngdocuvault" | sed 's/ngdocuvault-/  • /' | sed 's/-prod//' || echo "  No services running"
    fi
}

# Main script logic
main() {
    check_docker
    check_docker_compose
    setup_env
    
    local command="$1"
    shift || true
    
    case "$command" in
        "dev")
            start_dev "$@"
            ;;
        "prod")
            start_prod "$@"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services "$@"
            ;;
        "logs")
            show_logs "$@"
            ;;
        "build")
            build_images
            ;;
        "clean")
            clean_docker
            ;;
        "status")
            show_status
            ;;
        "shell")
            open_shell "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"