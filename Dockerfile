# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_BACKEND_URL_FOR_CLIENT_REQUESTS
ARG NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS
ENV NEXT_PUBLIC_BACKEND_URL_FOR_CLIENT_REQUESTS=${NEXT_PUBLIC_BACKEND_URL_FOR_CLIENT_REQUESTS}
ENV NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS=${NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS}
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

RUN mkdir -p ./public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
