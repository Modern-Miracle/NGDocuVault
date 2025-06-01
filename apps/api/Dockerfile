# NGDocuVault API Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY apps/api/package*.json ./apps/api/

# Copy workspace configuration
COPY pnpm-workspace.yaml turbo.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/pnpm-workspace.yaml /app/turbo.json ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Copy necessary files
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

# Change ownership to nodeuser
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/src/server.js"]