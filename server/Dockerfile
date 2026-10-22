FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo package manifests
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

# Install dependencies cleanly
RUN npm install

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY server/ ./server/

# Build shared package and server
RUN npm --workspace=packages/shared run build
RUN npm --workspace=server run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 8682

CMD ["node", "server/dist/index.js"]
