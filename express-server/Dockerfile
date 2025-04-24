FROM node:21-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY src/prisma src/prisma
RUN npx prisma generate --schema ./src/prisma/schema.prisma
COPY . .
RUN npm run build

FROM node:21-alpine AS final
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json .
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY src/prisma prisma
RUN npx prisma generate --schema ./prisma/schema.prisma

EXPOSE 8000
ENTRYPOINT [ "node", "dist/index.js" ]