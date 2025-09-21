# Single-stage production build
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.json ./

# Copy frontend application
COPY apps/frontend ./apps/frontend
COPY apps/frontend/public ./apps/frontend/public

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm build

# Set proper permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["pnpm", "start"]
