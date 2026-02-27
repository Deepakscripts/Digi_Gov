# Frontend Dockerfile for React/Vite application
# Multi-stage build optimized for Railway deployment

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
# Note: VITE_API_URL should be passed as build arg for production
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy nginx template configuration
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set default backend URL (can be overridden at runtime)
ENV BACKEND_URL=http://backend:5000

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx with envsubst for environment variable substitution
# nginx:alpine image automatically processes templates in /etc/nginx/templates/
CMD ["nginx", "-g", "daemon off;"]
