# Use an official Node.js image as the base image
FROM node:20-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY --chown=appuser:appgroup package*.json ./

# Delete existing node_modules if any
RUN rm -rf node_modules || true

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --shamefully-hoist

# Copy application code
COPY --chown=appuser:appgroup . .

# Switch to the non-root user
USER appuser

# Expose the port the application runs on
EXPOSE 3003

# Define the command to start the service
CMD ["node", "src/index.js"]
