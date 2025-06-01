# Docker Deployment Guide

This guide covers deploying NGDocuVault using Docker containers for both development and production environments.

## 🐳 Docker Overview

NGDocuVault provides comprehensive Docker support with:

- **Multi-stage builds** for optimized production images
- **Development environment** with hot-reloading and debugging
- **Production environment** with security hardening and monitoring
- **Orchestration** via Docker Compose for easy management
- **Service isolation** with proper networking and security

## 📋 Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher (or `docker compose` plugin)
- **Git**: For cloning the repository

### System Requirements
- **Memory**: Minimum 4GB RAM (8GB recommended for full stack)
- **Storage**: At least 10GB free space
- **CPU**: 2+ cores recommended
- **OS**: Linux, macOS, or Windows with WSL2

### Verify Installation
```bash
# Check Docker version
docker --version

# Check Docker Compose
docker compose version
# or
docker-compose --version

# Verify Docker is running
docker info
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/NGDocuVault-eu/ng-docuvault.git
cd ng-docuvault
```

### 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

### 3. Start Development Environment
```bash
# Using the helper script (recommended)
./docker-start.sh dev

# Or using Docker Compose directly
docker compose up -d
```

### 4. Access Services
- **Web Application**: http://localhost:3000
- **API Backend**: http://localhost:5000
- **Blockchain Node**: http://localhost:8545
- **Database**: localhost:1433
- **IPFS Gateway**: http://localhost:8080

## 🛠️ Development Environment

### Starting Services
```bash
# Start all services
./docker-start.sh dev

# Start with image rebuild
./docker-start.sh dev --build

# Using Docker Compose directly
docker compose up -d

# Start with logs visible
docker compose up
```

### Service Architecture

#### Core Services
- **`database`**: SQL Server for metadata storage
- **`blockchain`**: Hardhat node for smart contracts
- **`api`**: Express.js backend API
- **`web`**: React frontend application

#### Support Services
- **`ipfs`**: Local IPFS node for document storage
- **`redis`**: Session storage and caching

### Development Features
- **Hot Reloading**: Code changes trigger automatic rebuilds
- **Volume Mounts**: Source code mounted for live editing
- **Debug Ports**: Services expose debug ports when needed
- **Comprehensive Logging**: All services log to stdout/stderr

### Managing Services
```bash
# View service status
./docker-start.sh status
docker compose ps

# View logs
./docker-start.sh logs           # All services
./docker-start.sh logs api       # Specific service
docker compose logs -f api

# Restart services
./docker-start.sh restart
docker compose restart

# Stop services
./docker-start.sh stop
docker compose down
```

### Accessing Containers
```bash
# Open shell in API container
./docker-start.sh shell api
docker compose exec api /bin/sh

# Open shell in web container
./docker-start.sh shell web
docker compose exec web /bin/sh

# Execute commands in containers
docker compose exec api pnpm test
docker compose exec blockchain pnpm deploy
```

## 🏭 Production Environment

### Security Hardening

#### Image Security
- **Non-root users**: All containers run as non-privileged users
- **Read-only filesystems**: Containers use read-only root filesystems
- **Minimal base images**: Alpine Linux for smaller attack surface
- **No unnecessary privileges**: Security options disable privilege escalation

#### Network Security
- **Internal networking**: Services communicate via internal Docker network
- **Localhost binding**: Services bind to localhost only (reverse proxy required)
- **Firewall ready**: Designed to work with external firewalls

#### Secret Management
- **Environment variables**: Secrets passed via environment variables
- **External secret management**: Compatible with Docker secrets, Kubernetes secrets
- **No hardcoded secrets**: All sensitive data externalized

### Production Deployment
```bash
# Set up production environment
cp .env.example .env.prod
# Edit .env.prod with production values

# Start production stack
./docker-start.sh prod

# Start with monitoring
./docker-start.sh prod --monitoring

# Using Docker Compose directly
docker compose -f docker-compose.prod.yml up -d
```

### Production Services

#### Core Stack
- **`database`**: PostgreSQL for production reliability
- **`api`**: Production API with security hardening
- **`web`**: Nginx-served static files
- **`redis`**: Session storage and caching

#### Infrastructure
- **`nginx`**: Reverse proxy and load balancer
- **`prometheus`**: Metrics collection (optional)
- **`grafana`**: Monitoring dashboards (optional)

### Environment Variables

#### Required Production Variables
```bash
# Database
POSTGRES_DB=ngdocuvault
POSTGRES_USER=ngdocuvault
POSTGRES_PASSWORD=secure-password-here

# Security
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret

# Application
CORS_ORIGIN=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api

# External Services
WEB3_STORAGE_TOKEN=your-web3-storage-token
PINATA_JWT=your-pinata-jwt-token

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-key
VITE_CHAIN_ID=1
```

#### Optional Variables
```bash
# Azure Key Vault (recommended for production)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_KEY_VAULT_URL=https://your-vault.vault.azure.net/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
GRAFANA_ADMIN_PASSWORD=secure-admin-password

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

## 🔧 Service Configuration

### API Service
```yaml
# Dockerfile optimizations
FROM node:18-alpine AS builder
# Multi-stage build for smaller image
FROM node:18-alpine AS production
# Production runtime with minimal dependencies

# Security features
USER nodeuser                    # Non-root user
HEALTHCHECK --interval=30s      # Health monitoring
```

### Web Service
```yaml
# Nginx configuration
server {
    listen 3000;
    root /usr/share/nginx/html;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    
    # SPA routing
    try_files $uri $uri/ /index.html;
}
```

### Database Service
```yaml
# PostgreSQL for production
image: postgres:15-alpine
environment:
  POSTGRES_DB: ${POSTGRES_DB}
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

# Health checks
healthcheck:
  test: pg_isready -U ${POSTGRES_USER}
```

## 📊 Monitoring & Logging

### Development Monitoring
```bash
# View all service logs
./docker-start.sh logs

# Follow specific service logs
docker compose logs -f api

# Monitor resource usage
docker stats

# View service health
docker compose ps
```

### Production Monitoring

#### Prometheus Metrics
```bash
# Access Prometheus
http://localhost:9090

# Key metrics to monitor
- Container CPU usage
- Memory consumption
- API response times
- Database connections
- Document upload/download rates
```

#### Grafana Dashboards
```bash
# Access Grafana
http://localhost:3001
# Default: admin / admin (change in production)

# Pre-configured dashboards
- System Overview
- API Performance
- Database Metrics
- User Activity
```

#### Log Management
```bash
# Centralized logging
docker compose logs -f > app.log

# Log rotation
logrotate /etc/logrotate.d/docker-logs

# External log shipping
# Configure to send to ELK, Fluentd, etc.
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
lsof -i :3000

# Stop conflicting services
sudo systemctl stop apache2  # If using port 80
sudo systemctl stop nginx    # If using port 80
```

#### Permission Issues
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Reset Docker (if needed)
docker system prune -a
```

#### Memory Issues
```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Clean up unused resources
./docker-start.sh clean
```

#### Database Connection Issues
```bash
# Check database logs
docker compose logs database

# Test database connection
docker compose exec database psql -U ngdocuvault -d ngdocuvault -c "SELECT 1"

# Reset database
docker compose down -v  # WARNING: This deletes data
docker compose up database
```

#### Build Failures
```bash
# Clear build cache
docker builder prune

# Rebuild from scratch
docker compose build --no-cache

# Check build logs
docker compose build api 2>&1 | tee build.log
```

### Performance Optimization

#### Image Size Optimization
```dockerfile
# Use multi-stage builds
FROM node:18-alpine AS builder
# Build application
FROM node:18-alpine AS production
# Copy only production artifacts
```

#### Runtime Optimization
```yaml
# Resource limits
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

#### Network Optimization
```yaml
# Use internal networks
networks:
  ngdocuvault-network:
    driver: bridge
    internal: false  # Set to true for complete isolation
```

## 🚀 Deployment Strategies

### Development Deployment
```bash
# Local development
./docker-start.sh dev

# Development with external services
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up -d
```

### Staging Deployment
```bash
# Staging environment
cp .env.example .env.staging
# Configure staging variables

docker compose -f docker-compose.prod.yml --env-file .env.staging up -d
```

### Production Deployment
```bash
# Production deployment
./docker-start.sh prod --monitoring

# Blue-green deployment (advanced)
docker compose -f docker-compose.prod.yml -p ngdocuvault-blue up -d
# Test new version
docker compose -f docker-compose.prod.yml -p ngdocuvault-green up -d
# Switch traffic via load balancer
```

### Cloud Deployment

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml ngdocuvault
```

#### Kubernetes
```bash
# Convert compose to Kubernetes
kompose convert -f docker-compose.prod.yml

# Deploy to Kubernetes
kubectl apply -f ngdocuvault-deployment.yaml
```

#### AWS ECS
```bash
# Create ECS task definition
ecs-cli compose -f docker-compose.prod.yml create

# Deploy to ECS
ecs-cli compose -f docker-compose.prod.yml up
```

## 🔐 Security Best Practices

### Container Security
- Use official base images
- Update base images regularly
- Run containers as non-root users
- Use read-only filesystems where possible
- Limit container capabilities

### Network Security
- Use internal Docker networks
- Expose only necessary ports
- Implement proper firewall rules
- Use TLS for external communications

### Secret Management
- Never hardcode secrets in images
- Use environment variables or secret management systems
- Rotate secrets regularly
- Audit secret access

### Data Security
- Encrypt data at rest
- Use secure database configurations
- Implement proper backup strategies
- Monitor data access patterns

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Container Security Guide](https://docs.docker.com/engine/security/)
- [Production Deployment Checklist](../deployment/production-checklist.md)

---

This Docker deployment guide provides comprehensive coverage of both development and production deployment scenarios for NGDocuVault, ensuring secure and efficient containerized operations.