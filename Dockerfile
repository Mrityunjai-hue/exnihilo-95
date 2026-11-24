# syntax=docker/dockerfile:1
# Multi-stage production Dockerfile for ExNihilo 95
# Optimized for WebAssembly execution & standalone Next.js runtime

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Dependencies installation
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: Production Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set DOCKER_BUILD=1 so next.config.ts generates standalone output
ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Lightweight Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory (including sql-wasm.wasm and icons)
COPY --from=builder /app/public ./public

# Set correct permissions for Next.js prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
