# ============================================================================
# SaintsHub Next.js Application Dockerfile
# ============================================================================
# Multi-stage build for optimized production image
# ============================================================================

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (caching layer)
COPY package.json package-lock.json* ./

# Install npm dependencies
# --omit=dev to reduce image size, we'll reinstall in dev mode if needed
RUN npm ci --omit=dev

# Copy source code
COPY tsconfig.json next.config.mjs tailwind.config.postcss ./

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the source code
COPY src ./src

# Build the Next.js application
# With analysis for checking bundle size
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies
COPY package.json ./
RUN npm ci --omit=dev

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
# Using next start for production (PM2 or Docker orchestrator should manage this)
CMD ["npm", "start"]