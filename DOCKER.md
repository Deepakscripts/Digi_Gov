# Docker Deployment Guide for Digi Gov Portal

This guide covers how to run the Digi Gov Portal using Docker, both locally and on Railway.

## Project Structure

```
├── docker-compose.yml          # Main Docker Compose configuration
├── .env.example                 # Environment variables template
├── railway.toml                 # Railway-specific configuration
└── govt-digital-portal/
    ├── backend/
    │   ├── Dockerfile           # Backend container build
    │   └── .dockerignore        # Files to exclude from build
    └── frontend/
        ├── Dockerfile           # Frontend container build
        ├── nginx.conf           # Nginx configuration for SPA
        └── .dockerignore        # Files to exclude from build
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2

## Quick Start (Local Development)

1. **Clone the repository** and navigate to the project root.

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your configuration (optional for local dev):
   ```bash
   # Update JWT_SECRET for security
   JWT_SECRET=your-super-secret-key-here
   ```

4. **Build and run all services:**
   ```bash
   docker compose up --build
   ```

5. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Services

### MongoDB
- **Image:** mongo:7
- **Port:** 27017
- **Data Persistence:** Named volume `mongodb_data`

### Backend (Node.js/Express)
- **Base Image:** node:20-alpine
- **Port:** 5000
- **Features:**
  - Production-optimized multi-stage build
  - Non-root user for security
  - Health checks enabled
  - File uploads persistent storage

### Frontend (React/Vite + Nginx)
- **Build Image:** node:20-alpine
- **Runtime Image:** nginx:alpine
- **Port:** 80
- **Features:**
  - Multi-stage build for minimal image size
  - Gzip compression enabled
  - SPA routing configured
  - API proxy to backend
  - Security headers configured

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Backend port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongodb:27017/govt-shop-portal` |
| `JWT_SECRET` | JWT signing secret | `supersecretkey123` |
| `VITE_API_URL` | Frontend API URL (build-time) | `http://localhost:5000` |
| `AWS_ACCESS_KEY_ID` | AWS/R2 access key | (optional) |
| `AWS_SECRET_ACCESS_KEY` | AWS/R2 secret key | (optional) |
| `AWS_REGION` | AWS/R2 region | (optional) |
| `S3_BUCKET_NAME` | S3/R2 bucket name | (optional) |

## Deploying to Railway

### Method 1: Deploy All Services

1. **Create a new Railway project**

2. **Add MongoDB:**
   - Click "Add Service" → "Database" → "MongoDB"
   - Copy the connection string

3. **Deploy Backend:**
   - Add a new service from GitHub repo
   - Set the root directory to `govt-digital-portal/backend`
   - Add environment variables:
     ```
     MONGO_URI=<mongodb-connection-string>
     JWT_SECRET=<your-secure-secret>
     PORT=5000
     ```

4. **Deploy Frontend:**
   - Add a new service from GitHub repo
   - Set the root directory to `govt-digital-portal/frontend`
   - Add build argument:
     ```
     VITE_API_URL=https://<your-backend-url>.railway.app/api
     ```

### Method 2: Deploy with Docker Compose

Railway supports docker-compose deployments. Simply push to your connected repository and Railway will detect the `docker-compose.yml`.

**Note:** For Railway, you'll want to use their managed MongoDB plugin instead of the containerized one, and update `MONGO_URI` accordingly.

## Useful Commands

```bash
# Build without cache
docker compose build --no-cache

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: Deletes data!)
docker compose down -v

# Rebuild and restart a specific service
docker compose up -d --build backend

# Shell into a running container
docker compose exec backend sh
docker compose exec frontend sh

# Check service health
docker compose ps
```

## Troubleshooting

### Container won't start
Check logs with `docker compose logs <service-name>`

### MongoDB connection issues
Ensure MongoDB is healthy before backend starts (handled by `depends_on` with healthcheck)

### Frontend can't reach backend
- Verify nginx proxy is configured correctly
- Check that backend is running and healthy
- Ensure `VITE_API_URL` is set correctly at build time

### File uploads not persisting
Ensure the `backend_uploads` volume is mounted correctly

## Production Considerations

1. **Change JWT_SECRET** - Use a strong, unique secret
2. **Use Railway MongoDB plugin** - For managed database with backups
3. **Enable HTTPS** - Railway provides automatic SSL
4. **Set up monitoring** - Use Railway's metrics or integrate external monitoring
5. **Configure rate limiting** - Add to nginx or backend middleware
6. **Set up backups** - For MongoDB data and uploaded files
