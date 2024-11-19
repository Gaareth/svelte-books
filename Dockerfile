FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# COPY ENV variable
# COPY .env ./

# RUN npm install --frozen-lockfile
RUN npm install --omit=dev --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

# source code?
COPY . .
# RUN npm 

EXPOSE 3000
CMD ["node", "-r", "dotenv/config", "build"]

# exec time: 2m 37s including deploy