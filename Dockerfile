# Ovrload API — Railway-ready
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=3000 \
    TRUST_PROXY=1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER node
EXPOSE 3000
# Seed = idempotent upsert of the master exercise list, safe on every deploy
CMD ["sh", "-c", "node src/seed/seed.js && exec node src/server.js"]
