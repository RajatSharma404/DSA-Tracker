# ===================================================
# Stage 1: Install Dependencies
# ===================================================
FROM node:20-alpine AS deps

# libc6-compat may be needed for certain native libraries
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

# ===================================================
# Stage 2: Next.js Standalone Build
# ===================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for NextAuth/database adapter
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js with standalone output
RUN npm run build

# ===================================================
# Stage 3: Ultra-lightweight Production Runner (~150MB)
# ===================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user for process isolation
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Automatically leverage standalone output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3005}/ || exit 1

CMD ["node", "server.js"]
