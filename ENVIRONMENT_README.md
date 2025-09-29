# MyBlog Environment Management

This guide explains how to manage different environments (development, staging, production) for the MyBlog application.

## Overview

The application now supports environment-sensitive configurations where:

- **`NODE_ENV=development`** → Optimized for running on your local PC
- **`NODE_ENV=production`** → Optimized for running on servers

## Environment-Specific Behavior

### Development Environment (`NODE_ENV=development`)

- **Frontend**: Binds to `localhost` (avoids Windows permission issues)
- **Backend**: Allows CORS from `localhost` origins
- **API Rewrites**: Proxy to `http://localhost:8080` (development port)
- **Session Security**: `secure: false`, `sameSite: lax`
- **Docker Ports**: Backend on 8080, Frontend on 3000
- **Docker URLs**: All services use `localhost` for inter-service communication

### Production Environment (`NODE_ENV=production`)

- **Frontend**: Binds to `0.0.0.0` (Docker/server compatible)
- **Backend**: Restricts CORS to production domain (`PROD_URL`)
- **API Rewrites**: Proxy to `http://backend:3003` (Docker service name)
- **Session Security**: `secure: true`, `sameSite: strict`
- **Docker Ports**: Backend on 3003, Frontend on 3000
- **Docker URLs**: Services communicate via Docker network names

## Quick Environment Switching

Use the provided script to easily switch environments:

```bash
# Switch to development (local PC)
./switch-env.sh development

# Switch to production (servers)
./switch-env.sh production

# Check current environment
./switch-env.sh status

# Show help
./switch-env.sh help
```

## Manual Environment Configuration

If you prefer to set environments manually, update `NODE_ENV` in these files:

1. **Root `.env`**: `NODE_ENV=development` or `NODE_ENV=production`
2. **Backend `.env`**: `NODE_ENV=development` or `NODE_ENV=production`
3. **Frontend `.env.local`**: `NODE_ENV=development` or `NODE_ENV=production`

## Environment Variables Reference

### Required Variables

| Variable               | Development              | Production       | Description      |
| ---------------------- | ------------------------ | ---------------- | ---------------- |
| `NODE_ENV`             | `development`            | `production`     | Environment mode |
| `MONGODB_URI`          | Atlas connection         | Atlas connection | Database URL     |
| `JWT_SECRET`           | Any secret               | Strong secret    | Authentication   |
| `GOOGLE_CLIENT_ID`     | Dev OAuth app            | Prod OAuth app   | Google OAuth     |
| `GOOGLE_CLIENT_SECRET` | Dev secret               | Prod secret      | Google OAuth     |
| `NEXTAUTH_SECRET`      | Any secret               | Strong secret    | NextAuth         |
| `PROD_URL`             | `https://yourdomain.com` | Your domain      | Production URL   |

### Environment-Specific Variables

| Variable                       | Development             | Production | Purpose          |
| ------------------------------ | ----------------------- | ---------- | ---------------- |
| `PORT`                         | `8080`                  | `3003`     | Backend port     |
| `NEXT_PUBLIC_BACKEND_BASE_URL` | `http://localhost:8080` | N/A        | Frontend API URL |

## Running the Application

### Local Development

```bash
# Set development environment
./switch-env.sh development

# Start services
docker-compose up

# Or run frontend directly (after backend is running)
cd apps/frontend && pnpm dev
```

### Docker Development

```bash
# Set development environment
./switch-env.sh development

# Start all services in Docker
docker-compose up

# Frontend will be available at http://localhost:3000
# Backend will be available at http://localhost:8080 (configured port)
```

**Note**: Docker development uses `apps/frontend/Dockerfile.dev` which includes source code and hot reloading.

### Production Deployment

```bash
# Set production environment
./switch-env.sh production

# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Frontend Won't Start (Windows)

**Error**: `listen EACCES: permission denied 0.0.0.0:3000`

**Solution**: Make sure `NODE_ENV=development` is set. The frontend will bind to `localhost` instead of `0.0.0.0`.

### CORS Issues

**Development**: Backend allows `localhost` origins
**Production**: Backend only allows the domain specified in `PROD_URL`

### API Connection Issues

**Development**: Frontend proxies API calls to `http://localhost:3003`
**Production**: Frontend proxies API calls to `http://backend:3003` (Docker service)

## Security Considerations

- **Development**: Relaxed security for easier development
- **Production**: Strict security with HTTPS requirements
- **Secrets**: Use different secrets for each environment
- **CORS**: Restrictive in production, permissive in development

## Adding New Environments

To add a staging environment:

1. Update `switch-env.sh` to handle `staging`
2. Add staging-specific logic in configuration files
3. Create staging-specific environment variables

## File Structure

```
.env                    # Root environment variables
.env.example           # Template for root .env
apps/
├── backend/
│   ├── .env           # Backend environment variables
│   └── .env.example   # Backend .env template
└── frontend/
    ├── .env.local     # Frontend local overrides
    └── .env.example   # Frontend .env template
switch-env.sh          # Environment switching script
```

## Docker Compose Behavior

- **Development**: Uses `docker-compose.override.yml` (NODE_ENV from .env)
- **Production**: Uses `docker-compose.prod.yml` (NODE_ENV from .env)

Both compose files now read `NODE_ENV` from environment variables instead of hardcoded values.
