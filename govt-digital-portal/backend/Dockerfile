# Backend Dockerfile for Node.js Express API
# Optimized for Railway deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=expressjs:nodejs . .

# Remove development files
RUN rm -rf .env.example .gitignore

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown expressjs:nodejs uploads

# Make startup script executable
RUN chmod +x scripts/startup.sh

# Switch to non-root user
USER expressjs

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application using startup script (runs seed first)
CMD ["sh", "scripts/startup.sh"]
