# ===================================================
# Stage 1: Build & Prisma Generation
# ===================================================
FROM node:20-alpine AS builder

# Install OpenSSL required by Prisma CLI and client engine
RUN apk add --no-cache openssl

WORKDIR /app

# Install all dependencies (including devDependencies for TypeScript compilation)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and configuration
COPY tsconfig.json ./
COPY . .

# Compile TypeScript to dist/
RUN npm run build

# ===================================================
# Stage 2: Minimal Production Runtime
# ===================================================
FROM node:20-alpine AS runner

# Install OpenSSL (for Prisma) and curl (for Docker health checks)
RUN apk add --no-cache openssl curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package manifests and production dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Use built-in non-root node user for security
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

CMD ["node", "dist/index.js"]
