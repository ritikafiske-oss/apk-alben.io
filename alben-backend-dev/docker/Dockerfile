# Multi-stage Dockerfile for Alben Backend

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Configure pnpm store (shared cache)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/store

# Copy only package/dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with cache + low memory usage
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile \
    --network-concurrency=1 \
    --child-concurrency=1

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/store

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir /pnpm/store

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production deps with cache (--shamefully-hoist ensures peer deps like express are resolved)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --shamefully-hoist \
    --network-concurrency=1 \
    --child-concurrency=1 && \
    pnpm add ts-node tsconfig-paths typescript

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy TypeScript source files needed for migrations
COPY --from=builder /app/src/infrastructure/persistence/data-source.ts ./src/infrastructure/persistence/data-source.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy entire libs folder — covers all current and future migration files
# No need to update this when new libs with migrations are added
COPY --from=builder /app/libs ./libs

# Copy entrypoint script
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["./entrypoint.sh"]
