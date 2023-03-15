FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# COPY ENV variable
COPY .env ./

# RUN npm install --frozen-lockfile
RUN npm install --production
RUN npx prisma generate

# source code?
COPY . .
# RUN npm 

EXPOSE 3000
CMD ["node", "-r", "dotenv/config", "build"]

