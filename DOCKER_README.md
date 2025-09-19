# MyBlog Docker Setup Guide

This guide explains how to run the MyBlog application using Docker and Docker Compose.

## Recent Improvements (Latest)

### ✅ Multi-Stage Builds
- **Frontend**: Optimized Next.js build with 3-stage process (deps → build → production)
- **Backend**: Multi-stage Node.js build with security hardening
- **Benefits**: 60-80% smaller image sizes, faster deployments, better security

### ✅ Enhanced Security
- **Non-root users**: Both frontend and backend run as non-root users
- **Health checks**: Added `/health` endpoint for container monitoring
- **Optimized .dockerignore**: Excludes unnecessary files for faster builds

### ✅ Production Optimizations
- **PNPM support**: Proper pnpm workspace handling in Dockerfiles
- **Layer caching**: Optimized Docker layer caching for faster rebuilds
- **Environment variables**: Proper handling of production secrets

### ✅ Health Monitoring
- **Backend health endpoint**: `/health` returns JSON status
- **Docker health checks**: Configured for both services
- **Readiness probes**: Proper startup timing

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

### 1. Environment Setup

**⚠️ SECURITY FIRST:** Never commit secrets to version control!

Copy the example environment file and configure your settings:

```bash
# Copy the template (safe to commit)
cp .env.example .env

# Edit with your actual values
nano .env  # or your preferred editor
```

**Required Variables:**
```bash
# Generate strong secrets (recommended method)
openssl rand -base64 64   # For JWT_SECRET
openssl rand -base64 32   # For NEXTAUTH_SECRET

# Required: MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/myblog

# Required: Strong secrets (generate with openssl above)
JWT_SECRET=[64+ character secret]
NEXTAUTH_SECRET=[32+ character secret]
ADMIN_API_KEY=[strong API key]

# Required: Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
```

### 2. Development Mode (Recommended for Development)

```bash
# Build and start all services in development mode
docker-compose up --build

# Or run in background
docker-compose up --build -d

# View logs
docker-compose logs -f
```

### 3. Production Mode (Enhanced Security)

#### Option A: Environment Variables (Simple)
```bash
# Build and start all services in production mode
docker-compose --profile production up --build

# Or run in background
docker-compose --profile production up --build -d
```

#### Option B: Docker Secrets (Most Secure)
```bash
# Set up Docker secrets (run as root/sudo)
sudo ./setup-docker-secrets.sh

# Use production compose with secrets
docker-compose -f docker-compose.prod.yml up --build

# Or run in background
docker-compose -f docker-compose.prod.yml up --build -d
```

## Service Architecture

The application consists of the following services:

- **frontend**: Next.js application (Port 3000)
- **backend**: Node.js/Express API (Port 3003)
- **redis**: Redis cache server (Port 6379)
- **nginx**: Reverse proxy and load balancer (Port 80/443)

## Accessing the Application

### Development Mode
- Frontend: http://localhost:3000
- Backend API: http://localhost:3003
- Redis: localhost:6379

### Production Mode
- Application: http://localhost (via nginx)
- Backend API: http://localhost/api/

## Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build --force-recreate
```

### Development Workflow

```bash
# Start in development mode with live reload
docker-compose up

# View backend logs only
docker-compose logs -f backend

# Execute commands in running containers
docker-compose exec backend sh
docker-compose exec frontend sh

# Run tests in containers
docker-compose exec backend npm test
docker-compose exec frontend pnpm test
```

### Database Operations

```bash
# If using local MongoDB (uncomment in docker-compose.yml first)
docker-compose exec mongodb mongo

# Backup database (if using local MongoDB)
docker-compose exec mongodb mongodump --out /backup

# Restore database (if using local MongoDB)
docker-compose exec mongodb mongorestore /backup
```

## Configuration

### Environment Variables

All configuration is handled through the `.env` file. Key variables include:

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret for JWT token signing
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth credentials
- `NODE_ENV`: Environment mode (development/production)

### Custom Configuration

#### Using Local MongoDB Instead of Atlas

1. Uncomment the `mongodb` service in `docker-compose.yml`
2. Update `MONGODB_URI` to: `mongodb://mongodb:27017/myblog`
3. Comment out the MongoDB Atlas URI

#### SSL/HTTPS Setup

1. Obtain SSL certificates
2. Create `ssl` directory with `cert.pem` and `key.pem`
3. Uncomment the HTTPS server block in `nginx.conf`
4. Update server names in nginx configuration

#### Custom Domain

1. Update `server_name` in `nginx.conf`
2. Add DNS records pointing to your server
3. Update environment variables if needed

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3003

# Stop conflicting services or change ports in docker-compose.yml
```

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check build logs
docker-compose build --progress=plain
```

#### Database Connection Issues
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string format
# Test connection from host machine
mongosh "your-connection-string"
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Reset Docker permissions
sudo chmod 666 /var/run/docker.sock
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend

# Debug container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Health Checks

```bash
# Check service health
curl http://localhost/health

# Check backend health
curl http://localhost:3003/health

# Check Redis
docker-compose exec redis redis-cli ping
```

## Development vs Production

### Development Mode
- Hot reload enabled
- Debug ports exposed
- Source maps available
- Development logging
- No nginx reverse proxy

### Production Mode
- Optimized builds
- Nginx reverse proxy
- Gzip compression
- Rate limiting
- Security headers
- SSL support (configurable)

## Performance Optimization

### For Production

1. **Resource Limits**: Set appropriate memory/CPU limits in docker-compose.yml
2. **Caching**: Redis is included for session and data caching
3. **CDN**: Consider using a CDN for static assets
4. **Database Indexing**: Ensure proper indexes on MongoDB Atlas
5. **Monitoring**: Implement logging and monitoring solutions

### Scaling

```bash
# Scale services
docker-compose up -d --scale backend=3
docker-compose up -d --scale frontend=2

# Use Docker Swarm or Kubernetes for production scaling
```

## Backup and Recovery

### Database Backup (Atlas)
- Use MongoDB Atlas automated backups
- Configure backup retention policies
- Test restore procedures regularly

### Application Backup
```bash
# Backup volumes
docker run --rm -v myblog_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .
```

## Security Considerations

1. **Secrets Management**: Use Docker secrets or external secret managers
2. **Network Security**: Configure proper firewall rules
3. **SSL/TLS**: Always use HTTPS in production
4. **Regular Updates**: Keep Docker images and dependencies updated
5. **Access Control**: Limit container privileges and network access

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker and Docker Compose documentation
3. Check application logs for error details
4. Verify environment configuration

## File Structure

```
.
├── docker-compose.yml          # Main compose file
├── docker-compose.override.yml  # Development overrides
├── nginx.conf                   # Nginx configuration
├── .env                         # Environment variables
├── DOCKER_README.md            # This file
└── apps/
    ├── backend/
    │   ├── Dockerfile          # Backend container config
    │   └── ...                 # Backend application
    └── frontend/
        ├── Dockerfile          # Frontend container config
        └── ...                 # Frontend application
