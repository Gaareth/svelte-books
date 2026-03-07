FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG DATABASE_URL="file:./test.db"
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

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
