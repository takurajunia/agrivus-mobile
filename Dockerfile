# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-agrivus && \
    adduser -S nginx-agrivus -u 1001 && \
    chown -R nginx-agrivus:nginx-agrivus /usr/share/nginx/html && \
    chown -R nginx-agrivus:nginx-agrivus /var/cache/nginx && \
    chown -R nginx-agrivus:nginx-agrivus /var/log/nginx && \
    chown -R nginx-agrivus:nginx-agrivus /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-agrivus:nginx-agrivus /var/run/nginx.pid

# Switch to non-root user
USER nginx-agrivus

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]