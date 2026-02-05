# API image – build from repo root: docker build -f Dockerfile .
# This file is used when service root is repo root (e.g. apps/api/railway.json with dockerContext "..").
# Must build database package (generate + tsc) before API so @project-bridge/database resolves.
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

RUN npm ci --only=production

FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm ci

# Build API and all deps (database generate+build, types, api) via Turbo — same as CI and apps/api/Dockerfile
ENV DATABASE_URL=postgresql://localhost:5432/build
ENV TURBO_REMOTE_ONLY=false
RUN npx turbo run build --filter=@project-bridge/api

FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN apk add --no-cache dumb-init curl

WORKDIR /app
# Workspace deps are hoisted to root — packages/database/node_modules does not exist in builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json

USER nodejs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

WORKDIR /app/apps/api
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
