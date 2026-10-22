FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web-admin/package.json ./apps/web-admin/

RUN npm install

COPY packages/shared/ ./packages/shared/
COPY apps/web-admin/ ./apps/web-admin/

RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/web-admin run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web-admin/package.json ./apps/web-admin/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/web-admin/.next ./apps/web-admin/.next
COPY --from=builder /app/apps/web-admin/public ./apps/web-admin/public

EXPOSE 3000

CMD ["npm", "--workspace=apps/web-admin", "run", "start"]
