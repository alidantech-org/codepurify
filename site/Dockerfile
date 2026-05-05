# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
RUN apk add --no-cache curl
WORKDIR /app

COPY site/package.json site/package-lock.json* site/pnpm-lock.yaml* site/yarn.lock* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY site/ ./
COPY docs/ ../docs/

RUN \
  if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm build; \
  elif [ -f yarn.lock ]; then npm install -g yarn && yarn build; \
  else npm run build; \
  fi

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/docs ../docs/

EXPOSE 3000

CMD ["npm", "start"]