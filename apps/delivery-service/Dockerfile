# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy app package files
COPY apps/delivery-service/package.json ./apps/delivery-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/delivery-service ./apps/delivery-service

# Build the application
RUN pnpm --filter @delivery-service/api build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json for reference
COPY --from=builder /app/apps/delivery-service/package.json ./

# Copy node_modules (production dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/apps/delivery-service/dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
