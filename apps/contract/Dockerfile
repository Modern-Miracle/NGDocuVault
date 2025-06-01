# NGDocuVault Smart Contracts Dockerfile
# For running Hardhat node and contract operations

FROM node:18-alpine AS base

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY apps/contract/package*.json ./apps/contract/

# Copy workspace configuration
COPY pnpm-workspace.yaml turbo.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/contract ./apps/contract
COPY packages ./packages

# Change ownership to nodeuser
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Set working directory to contract
WORKDIR /app/apps/contract

# Compile contracts during build
RUN pnpm build

# Expose Hardhat node port
EXPOSE 8545

# Health check for Hardhat node
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').request({hostname:'localhost',port:8545,method:'POST',headers:{'Content-Type':'application/json'},timeout:5000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1)).end('{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}')"

# Default command runs Hardhat node
CMD ["pnpm", "dev:contract"]