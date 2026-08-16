FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@11.22.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# RUN npm ci // sometimes fails only when using docker buildx??
RUN pnpm install --frozen-lockfile
COPY . .

ARG DATABASE_URL="file:./test.db"
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm exec prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/src/generated src/generated/
COPY --from=builder /app/prisma prisma/
COPY docker-entrypoint.sh .
COPY prisma.config.ts .
RUN chmod +x docker-entrypoint.sh

COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
#CMD [ "node", "build" ]

# Run migrations, then the command
ENTRYPOINT ["/app/docker-entrypoint.sh"] 
CMD ["node", "-r", "dotenv/config", "build"]
