# Multi-stage build for Next.js
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
# Build-time environment variables
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_TINYMCE_API_KEY
ARG NEXT_PUBLIC_PROFILE_IMAGE_URL
ARG NEXT_PUBLIC_CONTACT_WHATSAPP
ARG NEXT_PUBLIC_CONTACT_GITHUB
ARG NEXT_PUBLIC_CONTACT_LINKEDIN
ARG NEXT_PUBLIC_CONTACT_FIVERR
ARG NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_TINYMCE_API_KEY=$NEXT_PUBLIC_TINYMCE_API_KEY
ENV NEXT_PUBLIC_PROFILE_IMAGE_URL=$NEXT_PUBLIC_PROFILE_IMAGE_URL
ENV NEXT_PUBLIC_CONTACT_WHATSAPP=$NEXT_PUBLIC_CONTACT_WHATSAPP
ENV NEXT_PUBLIC_CONTACT_GITHUB=$NEXT_PUBLIC_CONTACT_GITHUB
ENV NEXT_PUBLIC_CONTACT_LINKEDIN=$NEXT_PUBLIC_CONTACT_LINKEDIN
ENV NEXT_PUBLIC_CONTACT_FIVERR=$NEXT_PUBLIC_CONTACT_FIVERR
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/package.json ./

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

# Start application
CMD ["pnpm", "start"]
