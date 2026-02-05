# API image – build from repo root: docker build -f Dockerfile .
# This file lives at root so Railway's build context includes packages/ and apps/api.
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
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm ci
RUN npm install -g @nestjs/cli

WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app/apps/api
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN apk add --no-cache dumb-init curl

WORKDIR /app
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
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

WORKDIR /app/apps/api
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
