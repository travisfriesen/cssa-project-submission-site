FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./

ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV DATABASE_PATH=${DATABASE_PATH}
ENV CORS_ORIGIN=${CORS_ORIGIN}
ENV SUBMISSIONS_PATH=${SUBMISSIONS_PATH}

RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY src/ ./src/
COPY drizzle ./drizzle

RUN npm run build
RUN npm prune --production

FROM node:22-slim AS production
WORKDIR /app

ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV DATABASE_PATH=${DATABASE_PATH}
ENV CORS_ORIGIN=${CORS_ORIGIN}
ENV SUBMISSIONS_PATH=${SUBMISSIONS_PATH}

# Create non-root user/group
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/sh -m express

# Copy only built artifacts and production node_modules + package files from builder
COPY --from=builder --chown=express:nodejs /app/dist ./dist
COPY --from=builder --chown=express:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=express:nodejs /app/package*.json ./
COPY --from=builder --chown=express:nodejs /app/drizzle ./drizzle

RUN mkdir -p /app/database /app/submissions && chown -R express:nodejs /app/database /app/submissions

RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

COPY --chown=root:root entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE ${BACKEND_PORT}

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
