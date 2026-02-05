# Build from repository root only: docker build -f apps/api/Dockerfile .
# (Context must be . so COPY packages/database and COPY apps/api resolve.)
FROM node:24-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Install production dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM node:24-alpine AS builder
WORKDIR /app

# Copy source files (context must be repo root so packages/ and apps/ exist)
# Note: turbo.json omitted so build works when context excludes it (e.g. Railway); this image only runs nest build.
COPY package.json package-lock.json* ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install all dependencies (including dev)
RUN npm ci

# Install NestJS CLI for building
RUN npm install -g @nestjs/cli

# Build database package (generate Prisma client then compile so API can resolve @project-bridge/database)
WORKDIR /app/packages/database
RUN npm run generate && npm run build

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production image, copy all the files and run next
FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy production files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

WORKDIR /app/apps/api
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
