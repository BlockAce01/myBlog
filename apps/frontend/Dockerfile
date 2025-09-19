FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace configuration and lock file
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy root package.json for workspace setup
COPY package.json ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies with workspace awareness
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the frontend application
WORKDIR /app/apps/frontend
RUN pnpm build

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
