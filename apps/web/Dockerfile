# NGDocuVault Web Application Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY apps/web/package*.json ./apps/web/

# Copy workspace configuration
COPY pnpm-workspace.yaml turbo.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages

# Set environment variables for build
ARG VITE_API_BASE_URL
ARG VITE_CHAIN_ID
ARG VITE_LOCAL_RPC_URL
ARG VITE_WALLETCONNECT_PROJECT_ID

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_LOCAL_RPC_URL=${VITE_LOCAL_RPC_URL}
ENV VITE_WALLETCONNECT_PROJECT_ID=${VITE_WALLETCONNECT_PROJECT_ID}

# Build the application
WORKDIR /app/apps/web
RUN pnpm build

# Production stage - using nginx to serve static files
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create directories nginx needs
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]