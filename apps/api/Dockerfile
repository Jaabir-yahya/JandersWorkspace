FROM node:24-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
WORKDIR /app/apps/api
RUN npm install --only=production

# Rebuild the source code only when needed
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY packages ./packages
COPY apps/api ./apps/api
COPY package.json package-lock.json* turbo.json ./
WORKDIR /app/apps/api

# Install NestJS CLI for building
RUN npm install -g @nestjs/cli

# Install dev dependencies needed for build
RUN npm install --only=dev @types/passport-jwt @types/express

# Copy the database package to make it available
COPY packages/database ./packages/database

# Copy Prisma files from packages/database
COPY packages/database/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application
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
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy Prisma files for database operations
COPY --from=builder /app/prisma ./prisma

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