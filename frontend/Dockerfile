FROM node:25-alpine AS builder
WORKDIR /app

COPY package*.json ./

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY src/ ./src/
COPY vite.config.ts ./
COPY index.html ./

RUN npm run build

FROM node:25-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001 -G nodejs

COPY --from=builder --chown=app:nodejs /app/dist ./dist

RUN npm install -g serve

USER app

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
