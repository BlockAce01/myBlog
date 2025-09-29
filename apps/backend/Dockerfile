# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install timezone data and pnpm globally
RUN apk add --no-cache tzdata && npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Dependencies stage
FROM base AS deps
COPY apps/backend/package*.json ./
RUN pnpm install --ignore-scripts

# Build stage (if needed for transpilation)
FROM base AS builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY apps/backend/. .
# Add build step if you have TypeScript compilation or other build processes
# RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm in production stage
RUN npm install -g pnpm

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies
COPY --from=deps --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --from=builder --chown=appuser:appgroup /usr/src/app/src ./src
COPY --from=builder --chown=appuser:appgroup /usr/src/app/package.json ./
COPY --from=builder --chown=appuser:appgroup /usr/src/app/setup-admin.js ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3003

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "src/index.js"]
