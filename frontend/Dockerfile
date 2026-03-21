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
RUN npm prune --production 

FROM node:25-alpine AS production
WORKDIR /app

# Create non-root user/group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vite -u 1001 -G nodejs

# Copy only built artifacts and production node_modules + package files from builder
COPY --from=builder --chown=vite:nodejs /app/dist ./dist
COPY --from=builder --chown=vite:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=vite:nodejs /app/package*.json ./

USER vite

EXPOSE ${BACKEND_PORT}

CMD ["npm", "run", "preview"]

