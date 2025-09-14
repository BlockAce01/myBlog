FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

WORKDIR /app/apps/frontend

EXPOSE 3000
