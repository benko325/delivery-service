# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy app package files
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend ./apps/frontend

# Copy backend OpenAPI spec for type generation
COPY apps/delivery-service/openapi.json ./apps/delivery-service/openapi.json

# Generate API types
RUN pnpm --filter frontend generate:api

# Build the application
RUN pnpm --filter frontend build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files for production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.1 --activate

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/frontend/.output ./apps/frontend/.output

# Set environment
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=2999

WORKDIR /app/apps/frontend

# Expose port
EXPOSE 2999

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:2999/ || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
